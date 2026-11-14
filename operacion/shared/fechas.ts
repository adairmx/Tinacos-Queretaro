/** Fechas como texto "AAAA-MM-DD": un servicio se agenda para un día de calendario de su ciudad, no para un instante. */

const partes = (zona: string, cuando: Date) => {
  const formato = new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const valor = Object.fromEntries(formato.formatToParts(cuando).map((p) => [p.type, p.value]));
  return { fecha: `${valor.year}-${valor.month}-${valor.day}`, minutos: Number(valor.hour) * 60 + Number(valor.minute) };
};

/** Día de calendario y minutos desde la medianoche en la zona horaria dada. */
export const ahoraEn = (zona: string, cuando = new Date()) => partes(zona, cuando);

export function sumarDias(fecha: string, dias: number) {
  const [anio, mes, dia] = fecha.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(anio, mes - 1, dia + dias)).toISOString().slice(0, 10);
}

export const esFecha = (texto: string) => /^\d{4}-\d{2}-\d{2}$/.test(texto) && sumarDias(texto, 0) === texto;

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** "hoy", "mañana" o "el martes 17 de noviembre", según qué tan lejos queda de `hoy`. */
export function fechaHablada(fecha: string, hoy: string) {
  if (fecha === hoy) return "hoy";
  if (fecha === sumarDias(hoy, 1)) return "mañana";
  const [anio, mes, dia] = fecha.split("-").map(Number) as [number, number, number];
  const semana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
  return `el ${DIAS[semana]} ${dia} de ${MESES[mes - 1]}`;
}

export function fechaCorta(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number) as [number, number, number];
  const semana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
  return `${DIAS[semana]!.slice(0, 3)} ${dia} ${MESES[mes - 1]!.slice(0, 3)}`;
}
