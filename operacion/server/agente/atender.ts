import { telefonoBonito } from "../../shared/telefono.ts";
import type { Db } from "../db.ts";
import type { MensajeEntrante, WhatsApp } from "../lib/whatsapp.ts";
import { avisarALaCasa } from "../repos/avisos.ts";
import { agregarMensaje, conversacionDe, historialDe, marcarAtendidos, modoDe, pasarAHumano } from "../repos/conversaciones.ts";
import { responder, type Modelo } from "./agente.ts";

export interface Atencion {
  db: Db;
  modelo: Modelo;
  whatsapp: WhatsApp;
}

/**
 * ¿Le toca al agente contestarle a este teléfono? Sólo a quien pide informes: no a un proveedor, no a un cliente
 * con una cita en curso (ésos le escriben a la casa) y no si la casa ya tomó la plática.
 */
export async function leTocaAlAgente(db: Db, telefono: string) {
  const [ajeno] = await db.query(
    `SELECT 1 WHERE EXISTS (SELECT 1 FROM proveedores WHERE telefono = $1)
        OR EXISTS (SELECT 1 FROM servicios WHERE cliente_telefono = $1 AND estado IN ('agendado', 'tomado', 'en_camino'))`,
    [telefono],
  );
  return !ajeno && (await modoDe(db, telefono)) !== "humano";
}

/** Guarda en la plática lo que la persona acaba de escribir, para que el agente lo conteste. */
export async function anotarMensajeDelCliente(db: Db, mensaje: MensajeEntrante) {
  const conversacion = await conversacionDe(db, mensaje.telefono, mensaje.nombre);
  await agregarMensaje(db, conversacion.id, "cliente", mensaje.texto);
}

/**
 * Contesta lo que la persona tenga sin contestar. Si algo falla, no la deja esperando: le pasa la plática a la
 * casa y le avisa. Regresa lo que se le contestó, o undefined si no había nada que contestar.
 */
export async function atenderConversacion({ db, modelo, whatsapp }: Atencion, telefono: string) {
  const conversacion = await conversacionDe(db, telefono);
  if (conversacion.modo === "humano") return undefined;
  const { turnos, hasta, porAtender } = await historialDe(db, conversacion.id);
  if (!porAtender) return undefined;

  const quien = `${conversacion.nombre ?? "Alguien"} (${telefonoBonito(telefono)})`;
  const alPasarAHumano = async (motivo: string, resumen: string) => {
    await pasarAHumano(db, conversacion.id, motivo);
    await avisarALaCasa(db, "agente_pasa_platica", `El agente te pasó la plática de ${quien}: ${motivo}. ${resumen}`);
  };

  try {
    const [prospecto] = await db.query<{ id: number }>(
      "SELECT id FROM prospectos WHERE telefono = $1 AND estado IN ('nuevo', 'contactado') ORDER BY id DESC LIMIT 1",
      [telefono],
    );
    const respuesta = await responder(modelo, turnos, { db, telefono, simulado: false, prospectoId: prospecto?.id, alPasarAHumano });
    await whatsapp.enviarTexto(telefono, respuesta.texto);
    await agregarMensaje(db, conversacion.id, "agente", respuesta.texto);
    await marcarAtendidos(db, conversacion.id, hasta);
    return respuesta;
  } catch (error) {
    console.error("El agente no pudo contestar:", error);
    await alPasarAHumano("El agente falló al contestar", "Hay que contestarle a mano.");
    return undefined;
  }
}

/**
 * Deja pasar unos segundos desde el último mensaje antes de contestar, para responder de una vez a quien escribe
 * en varios mensajes seguidos, y nunca corre dos respuestas a la vez para el mismo teléfono.
 */
export function crearAtencion(atencion: Atencion, esperaMs: number) {
  const esperando = new Map<string, NodeJS.Timeout>();
  const contestando = new Set<string>();

  const programar = (telefono: string) => {
    clearTimeout(esperando.get(telefono));
    esperando.set(
      telefono,
      setTimeout(async () => {
        esperando.delete(telefono);
        // Si todavía se le está contestando, se vuelve a intentar después: lo nuevo no se pierde.
        if (contestando.has(telefono)) return programar(telefono);
        contestando.add(telefono);
        try {
          await atenderConversacion(atencion, telefono);
        } catch (error) {
          console.error("Atención del agente:", error);
        } finally {
          contestando.delete(telefono);
        }
      }, esperaMs),
    );
  };
  return programar;
}
