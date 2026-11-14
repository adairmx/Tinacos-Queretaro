import type { Turno } from "../agente/agente.ts";
import type { Consulta } from "../db.ts";

export interface Conversacion {
  id: number;
  telefono: string;
  nombre: string | null;
  modo: "agente" | "humano";
}

/** La conversación de WhatsApp de un teléfono; la crea si es la primera vez que escribe. */
export async function conversacionDe(q: Consulta, telefono: string, nombre?: string | null) {
  const [conversacion] = await q.query<Conversacion>(
    `INSERT INTO conversaciones (canal, telefono, nombre) VALUES ('whatsapp', $1, $2)
     ON CONFLICT (canal, telefono) DO UPDATE SET nombre = COALESCE(conversaciones.nombre, $2), actualizado_en = now()
     RETURNING id, telefono, nombre, modo`,
    [telefono, nombre ?? null],
  );
  return conversacion!;
}

export const modoDe = async (q: Consulta, telefono: string) =>
  (await q.query<{ modo: Conversacion["modo"] }>("SELECT modo FROM conversaciones WHERE canal = 'whatsapp' AND telefono = $1", [telefono]))[0]?.modo;

export const agregarMensaje = (q: Consulta, conversacionId: number, rol: Turno["rol"], texto: string) =>
  q.query("INSERT INTO mensajes (conversacion_id, rol, texto, atendido) VALUES ($1, $2, $3, $4)", [conversacionId, rol, texto, rol !== "cliente"]);

/** Lo último que se ha dicho en la plática, en orden, y hasta qué mensaje llega. */
export async function historialDe(q: Consulta, conversacionId: number, limite = 40) {
  const filas = await q.query<Turno & { id: number; atendido: boolean }>(
    "SELECT id, rol, texto, atendido FROM (SELECT * FROM mensajes WHERE conversacion_id = $1 ORDER BY id DESC LIMIT $2) recientes ORDER BY id",
    [conversacionId, limite],
  );
  return {
    turnos: filas.map(({ rol, texto }) => ({ rol, texto })),
    hasta: filas.at(-1)?.id ?? 0,
    porAtender: filas.some((fila) => fila.rol === "cliente" && !fila.atendido),
  };
}

export const marcarAtendidos = (q: Consulta, conversacionId: number, hasta: number) =>
  q.query("UPDATE mensajes SET atendido = true WHERE conversacion_id = $1 AND id <= $2 AND NOT atendido", [conversacionId, hasta]);

/** La casa toma la plática: el agente deja de contestarle a esa persona. */
export const pasarAHumano = (q: Consulta, conversacionId: number, motivo: string) =>
  q.query("UPDATE conversaciones SET modo = 'humano', motivo_humano = $2, actualizado_en = now() WHERE id = $1", [conversacionId, motivo]);
