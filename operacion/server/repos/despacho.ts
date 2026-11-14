import type { Db } from "../db.ts";
import type { NombreDePlantilla } from "../lib/plantillas.ts";
import { ErrorDeWhatsApp, type Acuse, type MensajeEntrante, type WhatsApp } from "../lib/whatsapp.ts";
import { avisarALaCasa } from "./avisos.ts";
import { guardarProspecto } from "./prospectos.ts";

/** Después de estos intentos el aviso queda como fallido y se manda a mano desde el panel. */
export const INTENTOS_MAXIMOS = 5;

interface PorMandar {
  id: number;
  telefono: string;
  plantilla: NombreDePlantilla;
  variables: string[] | string;
  intentos: number;
}

/**
 * Manda por WhatsApp los avisos pendientes. Cada aviso se aparta antes de mandarse, para que dos ciclos no lo
 * manden doble, y los que fallan por algo pasajero se reintentan dejando cada vez más tiempo entre intentos.
 */
export async function despacharAvisos(db: Db, whatsapp: WhatsApp, limite = 20) {
  const apartados = await db.query<PorMandar>(
    `UPDATE avisos SET intentos = intentos + 1, ultimo_intento_en = now()
      WHERE id IN (
        SELECT id FROM avisos
         WHERE estado = 'pendiente' AND telefono IS NOT NULL AND plantilla IS NOT NULL
           AND (ultimo_intento_en IS NULL OR ultimo_intento_en < now() - make_interval(mins => intentos * 2))
         ORDER BY id LIMIT $1 FOR UPDATE SKIP LOCKED)
      RETURNING id, telefono, plantilla, variables, intentos`,
    [limite],
  );

  let enviados = 0;
  for (const aviso of apartados) {
    const variables = typeof aviso.variables === "string" ? (JSON.parse(aviso.variables) as string[]) : aviso.variables;
    try {
      const wamid = await whatsapp.enviarPlantilla(aviso.telefono, aviso.plantilla, variables);
      await db.query("UPDATE avisos SET estado = 'enviado', enviado_en = now(), wamid = $2, error = NULL WHERE id = $1", [aviso.id, wamid]);
      enviados++;
    } catch (error) {
      const reintentar = error instanceof ErrorDeWhatsApp && error.reintentable && aviso.intentos < INTENTOS_MAXIMOS;
      const mensaje = error instanceof ErrorDeWhatsApp ? error.message : "Falló el envío por WhatsApp.";
      if (!(error instanceof ErrorDeWhatsApp)) console.error("Envío de aviso por WhatsApp:", error);
      await db.query("UPDATE avisos SET estado = $2, error = $3 WHERE id = $1", [aviso.id, reintentar ? "pendiente" : "fallido", mensaje]);
    }
  }
  return enviados;
}

/** Anota lo que WhatsApp dice de un mensaje que mandamos: entregado, leído o que no se pudo entregar. */
export async function anotarAcuse(db: Db, acuse: Acuse) {
  if (acuse.estado === "delivered") {
    await db.query("UPDATE avisos SET entregado_en = COALESCE(entregado_en, now()) WHERE wamid = $1", [acuse.wamid]);
  } else if (acuse.estado === "read") {
    await db.query("UPDATE avisos SET entregado_en = COALESCE(entregado_en, now()), leido_en = COALESCE(leido_en, now()) WHERE wamid = $1", [acuse.wamid]);
  } else if (acuse.estado === "failed") {
    await db.query("UPDATE avisos SET estado = 'fallido', error = $2 WHERE wamid = $1 AND estado = 'enviado'", [acuse.wamid, acuse.error ?? "WhatsApp no pudo entregar el mensaje."]);
  }
}

/**
 * Guarda lo que alguien escribió por WhatsApp y se lo hace saber a la casa. Mientras no haya un agente que
 * conteste, la respuesta de un cliente a su confirmación no se puede quedar sin que nadie la vea. Quien escribe
 * sin tener una cita en curso (alguien nuevo, o un cliente que vuelve) entra a la bandeja de leads.
 * Regresa false si ese mensaje ya se había recibido.
 */
export async function recibirMensaje(db: Db, mensaje: MensajeEntrante, opciones: { loAtiendeElAgente?: boolean } = {}) {
  return db.transaccion(async (tx) => {
    const [proveedor] = await tx.query<{ id: number; nombre: string }>("SELECT id, nombre FROM proveedores WHERE telefono = $1", [mensaje.telefono]);
    const [servicio] = await tx.query<{ id: number; cliente_nombre: string }>(
      "SELECT id, cliente_nombre FROM servicios WHERE cliente_telefono = $1 AND estado IN ('agendado', 'tomado', 'en_camino') ORDER BY id DESC LIMIT 1",
      [mensaje.telefono],
    );

    const nuevos = await tx.query(
      "INSERT INTO mensajes_entrantes (wamid, telefono, nombre, texto, servicio_id, proveedor_id) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (wamid) DO NOTHING RETURNING id",
      [mensaje.wamid, mensaje.telefono, mensaje.nombre, mensaje.texto, proveedor ? null : (servicio?.id ?? null), proveedor?.id ?? null],
    );
    if (nuevos.length === 0) return false;

    let quien: string;
    if (proveedor) {
      quien = `El proveedor ${proveedor.nombre}`;
    } else if (servicio) {
      quien = `${servicio.cliente_nombre} (servicio #${servicio.id})`;
    } else {
      const { prospecto, repetido } = await guardarProspecto(tx, { nombre: mensaje.nombre, telefono: mensaje.telefono, notas: mensaje.texto, origen: "whatsapp" });
      // Un lead nuevo ya trae su propio aviso. Si vuelve a escribir, la casa se entera, salvo que le esté contestando
      // el agente: entonces sólo se le avisa cuando el agente le pasa la plática.
      if (!repetido || opciones.loAtiendeElAgente) return true;
      quien = `${prospecto.nombre} (lead #${prospecto.id})`;
    }
    await avisarALaCasa(tx, "mensaje_entrante", `${quien} escribió por WhatsApp: «${mensaje.texto.slice(0, 500)}»`, {
      servicioId: proveedor ? null : servicio?.id,
      proveedorId: proveedor?.id,
    });
    return true;
  });
}
