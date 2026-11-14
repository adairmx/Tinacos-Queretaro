import type { Aviso } from "../../shared/tipos.ts";
import { config } from "../config.ts";
import type { Consulta } from "../db.ts";
import { limpiarVariable, redactar, type NombreDePlantilla } from "../lib/plantillas.ts";
import { iso } from "../lib/sql.ts";

interface AvisoNuevo {
  para: "proveedor" | "cliente";
  /** La plantilla de WhatsApp con la que sale; también es el motivo del aviso. */
  plantilla: Exclude<NombreDePlantilla, "aviso_interno">;
  variables: string[];
  telefono: string | null | undefined;
  servicioId?: number | null;
  proveedorId?: number | null;
}

async function guardar(q: Consulta, aviso: { para: Aviso["para"]; motivo: string; plantilla: NombreDePlantilla; variables: string[]; telefono: string | null; servicioId?: number | null; proveedorId?: number | null }) {
  const variables = aviso.variables.map(limpiarVariable);
  await q.query(
    "INSERT INTO avisos (servicio_id, para, proveedor_id, telefono, motivo, plantilla, variables, texto) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)",
    [aviso.servicioId ?? null, aviso.para, aviso.proveedorId ?? null, aviso.telefono, aviso.motivo, aviso.plantilla, JSON.stringify(variables), redactar(aviso.plantilla, variables)],
  );
}

/** Deja listo un aviso para un proveedor o un cliente. Sale solo por WhatsApp si está conectado; si no, a mano desde el panel. */
export const avisar = (q: Consulta, aviso: AvisoNuevo) =>
  guardar(q, { ...aviso, motivo: aviso.plantilla, telefono: aviso.telefono ?? null });

/** Algo que la casa tiene que saber. Se ve en el panel y, si hay un WhatsApp de administración, también llega ahí. */
export async function avisarALaCasa(q: Consulta, motivo: string, texto: string, referencia: { servicioId?: number | null; proveedorId?: number | null } = {}) {
  const variables = [limpiarVariable(texto)];
  await q.query(
    "INSERT INTO avisos (servicio_id, para, proveedor_id, telefono, motivo, plantilla, variables, texto) VALUES ($1, 'admin', $2, $3, $4, 'aviso_interno', $5::jsonb, $6)",
    [referencia.servicioId ?? null, referencia.proveedorId ?? null, config.adminWhatsapp ?? null, motivo, JSON.stringify(variables), variables[0]],
  );
}

/** Retira los avisos a proveedores de un servicio que ya no está disponible. */
export const descartarOfertas = (q: Consulta, servicioId: number) =>
  q.query("UPDATE avisos SET estado = 'descartado' WHERE servicio_id = $1 AND motivo = 'servicio_nuevo' AND estado IN ('pendiente', 'fallido')", [servicioId]);

/** Lo que falta por mandar o por ver: lo pendiente y lo que WhatsApp no pudo entregar. */
export const avisosPendientes = (q: Consulta) =>
  q.query<Aviso>(
    `SELECT a.id, a.servicio_id, a.para, a.proveedor_id, a.telefono, a.motivo, a.texto, a.estado, a.error, ${iso("a.creado_en")},
            CASE a.para WHEN 'proveedor' THEN p.nombre WHEN 'cliente' THEN s.cliente_nombre ELSE 'Administración' END AS destinatario
       FROM avisos a
       LEFT JOIN proveedores p ON p.id = a.proveedor_id
       LEFT JOIN servicios s ON s.id = a.servicio_id
      WHERE a.estado IN ('pendiente', 'fallido')
      ORDER BY a.creado_en, a.id`,
  );

export async function resolverAviso(q: Consulta, id: number, estado: "enviado" | "descartado") {
  const filas = await q.query(
    "UPDATE avisos SET estado = $2, enviado_en = CASE WHEN $2 = 'enviado' THEN now() ELSE enviado_en END WHERE id = $1 AND estado IN ('pendiente', 'fallido') RETURNING id",
    [id, estado],
  );
  return filas.length > 0;
}
