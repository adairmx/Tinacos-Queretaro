import { BLOQUES, esBloque, textoDeBloque } from "../../shared/bloques.ts";
import { ciudadPorSlug } from "../../shared/ciudades.ts";
import { ahoraEn, esFecha, fechaHablada, sumarDias } from "../../shared/fechas.ts";
import type { Espacio, OpcionDeHorario } from "../../shared/tipos.ts";
import type { Consulta } from "../db.ts";
import { Rechazo } from "../lib/rechazo.ts";

/** Hasta cuántos días adelante se agenda y puede un proveedor cargar su disponibilidad. */
export const DIAS_DE_AGENDA = 14;

function validarEspacio(fecha: string, bloque: string) {
  if (!esFecha(fecha)) throw new Rechazo("fecha_invalida", "La fecha no es válida.", 400);
  if (!esBloque(bloque)) throw new Rechazo("bloque_invalido", "Ese horario no existe.", 400);
}

export async function fijarDisponibilidad(q: Consulta, proveedorId: number, fecha: string, bloque: string, disponible: boolean) {
  validarEspacio(fecha, bloque);
  if (disponible) {
    await q.query("INSERT INTO disponibilidad (proveedor_id, fecha, bloque) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [proveedorId, fecha, bloque]);
  } else {
    await q.query("DELETE FROM disponibilidad WHERE proveedor_id = $1 AND fecha = $2 AND bloque = $3", [proveedorId, fecha, bloque]);
  }
}

export const disponibilidadDe = (q: Consulta, proveedorId: number, desde: string, hasta: string) =>
  q.query<Espacio>(
    "SELECT fecha::text AS fecha, bloque FROM disponibilidad WHERE proveedor_id = $1 AND fecha BETWEEN $2 AND $3 ORDER BY fecha, bloque",
    [proveedorId, desde, hasta],
  );

/** Repite en la semana siguiente lo que el proveedor marcó en los siete días que empiezan en `desde`. */
export async function copiarSemana(q: Consulta, proveedorId: number, desde: string) {
  if (!esFecha(desde)) throw new Rechazo("fecha_invalida", "La fecha no es válida.", 400);
  const filas = await q.query(
    `INSERT INTO disponibilidad (proveedor_id, fecha, bloque)
     SELECT proveedor_id, fecha + 7, bloque FROM disponibilidad
      WHERE proveedor_id = $1 AND fecha BETWEEN $2::date AND $2::date + 6
     ON CONFLICT DO NOTHING RETURNING fecha`,
    [proveedorId, desde],
  );
  return filas.length;
}

const clave = (fecha: string, bloque: string) => `${fecha}|${bloque}`;

/**
 * Cuántos servicios más caben en cada bloque de una ciudad: proveedores activos que lo ofrecen y siguen libres,
 * menos los servicios ya agendados ahí que nadie ha tomado. Así no se promete más de lo que se puede atender.
 */
export async function cupos(q: Consulta, ciudad: string, desde: string, hasta: string) {
  const libres = await q.query<Espacio & { total: number }>(
    `SELECT d.fecha::text AS fecha, d.bloque, count(*)::int AS total
       FROM disponibilidad d
       JOIN proveedores p ON p.id = d.proveedor_id AND p.estado = 'activo'
       JOIN proveedor_ciudades pc ON pc.proveedor_id = p.id AND pc.ciudad = $1
      WHERE d.fecha BETWEEN $2 AND $3
        AND NOT EXISTS (SELECT 1 FROM servicios s
                         WHERE s.proveedor_id = p.id AND s.fecha = d.fecha AND s.bloque = d.bloque AND s.estado <> 'cancelado')
      GROUP BY d.fecha, d.bloque`,
    [ciudad, desde, hasta],
  );
  const sinTomar = await q.query<Espacio & { total: number }>(
    `SELECT fecha::text AS fecha, bloque, count(*)::int AS total FROM servicios
      WHERE ciudad = $1 AND fecha BETWEEN $2 AND $3 AND proveedor_id IS NULL AND estado = 'agendado'
      GROUP BY fecha, bloque`,
    [ciudad, desde, hasta],
  );

  const cupo = new Map(libres.map((fila) => [clave(fila.fecha, fila.bloque), fila.total]));
  for (const fila of sinTomar) cupo.set(clave(fila.fecha, fila.bloque), (cupo.get(clave(fila.fecha, fila.bloque)) ?? 0) - fila.total);
  return cupo;
}

export async function cupoDe(q: Consulta, ciudad: string, fecha: string, bloque: string) {
  return (await cupos(q, ciudad, fecha, fecha)).get(clave(fecha, bloque)) ?? 0;
}

/** Bloques que todavía se pueden ofrecer, del más cercano al más lejano, con su cupo. */
export async function horariosConCupo(q: Consulta, ciudad: string, ahora: Date, anticipacionMinutos: number) {
  const zona = ciudadPorSlug(ciudad)?.zona;
  if (!zona) throw new Rechazo("ciudad_desconocida", "No trabajamos en esa ciudad.", 400);

  const { fecha: hoy, minutos } = ahoraEn(zona, ahora);
  const cupo = await cupos(q, ciudad, hoy, sumarDias(hoy, DIAS_DE_AGENDA));
  const opciones: OpcionDeHorario[] = [];

  for (let dia = 0; dia <= DIAS_DE_AGENDA; dia++) {
    const fecha = sumarDias(hoy, dia);
    for (const bloque of BLOQUES) {
      if (dia === 0 && bloque.inicio < minutos + anticipacionMinutos) continue;
      const disponibles = cupo.get(clave(fecha, bloque.id)) ?? 0;
      if (disponibles > 0) {
        opciones.push({ fecha, bloque: bloque.id, cupo: disponibles, texto: `${fechaHablada(fecha, hoy)} ${textoDeBloque(bloque.id)}` });
      }
    }
  }
  return opciones;
}

/**
 * Las dos opciones que se le dan al cliente: el espacio más cercano y el primero de otro día
 * ("hoy a tal hora o mañana a tal hora"). Si sólo hay un día con espacio, los dos primeros de ese día.
 */
export const opcionesParaCliente = async (q: Consulta, ciudad: string, ahora: Date, anticipacionMinutos: number) =>
  elegirDos(await horariosConCupo(q, ciudad, ahora, anticipacionMinutos));

/** De todos los horarios con lugar, los dos que se ofrecen. */
export function elegirDos(todas: OpcionDeHorario[]) {
  const primera = todas[0];
  if (!primera) return [];
  const segunda = todas.find((opcion) => opcion.fecha !== primera.fecha) ?? todas[1];
  return segunda ? [primera, segunda] : [primera];
}

export { validarEspacio };
