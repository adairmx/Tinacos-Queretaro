/**
 * El día de un proveedor se parte en bloques de dos horas. Sólo el primero tiene hora fija de llegada;
 * en los demás la hora es aproximada porque depende de cómo salgan los servicios anteriores.
 */
export interface Bloque {
  id: string;
  /** Hora de inicio en minutos desde la medianoche. */
  inicio: number;
  fin: number;
  horaFija: boolean;
}

export const BLOQUES: Bloque[] = [
  { id: "b08", inicio: 8 * 60, fin: 10 * 60, horaFija: true },
  { id: "b10", inicio: 10 * 60, fin: 12 * 60, horaFija: false },
  { id: "b12", inicio: 12 * 60, fin: 14 * 60, horaFija: false },
  { id: "b14", inicio: 14 * 60, fin: 16 * 60, horaFija: false },
  { id: "b16", inicio: 16 * 60, fin: 18 * 60, horaFija: false },
];

export const bloquePorId = (id: string) => BLOQUES.find((b) => b.id === id);
export const esBloque = (id: string) => BLOQUES.some((b) => b.id === id);

export function horaDoce(minutos: number) {
  const hora = Math.floor(minutos / 60);
  const resto = String(minutos % 60).padStart(2, "0");
  return `${hora % 12 === 0 ? 12 : hora % 12}:${resto} ${hora < 12 ? "a.m." : "p.m."}`;
}

/** Cómo se le dice el horario al cliente: hora fija en el primer servicio, aproximada en los demás. */
export function textoDeBloque(id: string) {
  const bloque = bloquePorId(id);
  if (!bloque) return id;
  return bloque.horaFija
    ? `a las ${horaDoce(bloque.inicio)}`
    : `entre ${horaDoce(bloque.inicio)} y ${horaDoce(bloque.fin)} (hora aproximada)`;
}

/** Etiqueta corta para tablas y botones. */
export function etiquetaDeBloque(id: string) {
  const bloque = bloquePorId(id);
  return bloque ? `${horaDoce(bloque.inicio).replace(":00", "")} – ${horaDoce(bloque.fin).replace(":00", "")}` : id;
}
