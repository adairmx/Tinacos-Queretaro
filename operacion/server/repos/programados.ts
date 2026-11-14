import { bloquePorId, textoDeBloque } from "../../shared/bloques.ts";
import { ciudadPorSlug } from "../../shared/ciudades.ts";
import { ahoraEn, sumarDias } from "../../shared/fechas.ts";
import { NOMBRE_DE_TIPO, type TipoDeServicio } from "../../shared/precios.ts";
import type { Consulta, Db } from "../db.ts";
import { avisar, avisarALaCasa } from "./avisos.ts";

/** A qué hora local sale cada aviso, en minutos desde la medianoche. */
export const HORARIO = {
  /** Confirmación de la noche anterior. */
  noche: 19 * 60,
  /** Confirmación de la mañana: una hora antes del primer servicio del día, que empieza a las 8. */
  manana: 7 * 60,
  /** El recordatorio de seis meses sólo sale en horas en que se puede escribir a un cliente. */
  recordatorioDesde: 10 * 60,
  recordatorioHasta: 18 * 60,
};

export const DIAS_PARA_RECORDATORIO = 180;

interface Pendiente {
  id: number;
  cliente_nombre: string;
  cliente_telefono: string;
  ciudad: string;
  tipo: TipoDeServicio;
  fecha: string;
  bloque: string;
  estado: string;
  proveedor_id: number | null;
  creado_en: string;
  confirmacion_noche_en: string | null;
  confirmacion_manana_en: string | null;
}

/** El horario puede terminar en "a.m." o "p.m.": no se le pone otro punto encima. */
const conPunto = (frase: string) => (frase.endsWith(".") ? frase : `${frase}.`);
const nombreDePila = (nombre: string) => nombre.trim().split(/\s+/)[0] ?? nombre;
const servicioEnFrase = (tipo: TipoDeServicio) => NOMBRE_DE_TIPO[tipo].toLowerCase();

/** Marca el aviso como atendido; regresa false si otro ciclo del vigía ya lo había hecho. */
async function marcar(q: Consulta, columna: "confirmacion_noche_en" | "confirmacion_manana_en" | "recordatorio_en", id: number) {
  const filas = await q.query(`UPDATE servicios SET ${columna} = now() WHERE id = $1 AND ${columna} IS NULL RETURNING id`, [id]);
  return filas.length > 0;
}

async function confirmar(db: Db, servicio: Pendiente, momento: "noche" | "manana", ahora: Date) {
  const zona = ciudadPorSlug(servicio.ciudad)?.zona;
  const bloque = bloquePorId(servicio.bloque);
  if (!zona || !bloque) return 0;

  const local = ahoraEn(zona, ahora);
  const diaDelAviso = momento === "noche" ? sumarDias(servicio.fecha, -1) : servicio.fecha;
  const toca = local.fecha === diaDelAviso && local.minutos >= HORARIO[momento] && (momento === "noche" || local.minutos < bloque.inicio);
  if (!toca) return 0;

  const columna = momento === "noche" ? "confirmacion_noche_en" : "confirmacion_manana_en";
  return db.transaccion(async (tx) => {
    if (!(await marcar(tx, columna, servicio.id))) return 0;

    // Si la cita se hizo después de la hora del aviso, el cliente acaba de hablar con nosotros: no se le repite.
    const creado = ahoraEn(zona, new Date(servicio.creado_en));
    if (creado.fecha === diaDelAviso && creado.minutos >= HORARIO[momento]) return 0;

    const cuando = `${momento === "noche" ? "mañana" : "hoy"} ${textoDeBloque(servicio.bloque)}`;

    // Sin proveedor no se le confirma nada al cliente: primero hay que conseguir quién vaya.
    if (!servicio.proveedor_id) {
      await avisarALaCasa(
        tx,
        "sin_proveedor_urgente",
        `El servicio #${servicio.id} de ${servicio.cliente_nombre} es ${cuando} y nadie lo ha tomado: no se le confirmó al cliente.`,
        { servicioId: servicio.id },
      );
      return 1;
    }

    await avisar(tx, {
      para: "cliente",
      plantilla: momento === "noche" ? "confirmacion_noche" : "confirmacion_manana",
      variables: [nombreDePila(servicio.cliente_nombre), servicioEnFrase(servicio.tipo), conPunto(cuando)],
      telefono: servicio.cliente_telefono,
      servicioId: servicio.id,
    });
    return 1;
  });
}

/** A los seis meses de un servicio terminado se invita al cliente al siguiente, salvo que ya haya vuelto. */
async function recordar(db: Db, ahora: Date) {
  const vencidos = await db.query<Pick<Pendiente, "id" | "cliente_nombre" | "cliente_telefono" | "ciudad" | "tipo"> & { volvio: boolean }>(
    `SELECT s.id, s.cliente_nombre, s.cliente_telefono, s.ciudad, s.tipo,
            EXISTS (SELECT 1 FROM servicios o
                     WHERE o.cliente_telefono = s.cliente_telefono AND o.id <> s.id AND o.estado <> 'cancelado'
                       AND o.creado_en > s.realizado_en) AS volvio
       FROM servicios s
      WHERE s.estado = 'realizado' AND s.recordatorio_en IS NULL
        AND s.realizado_en <= $1::timestamptz - make_interval(days => $2)
      ORDER BY s.realizado_en LIMIT 200`,
    [ahora.toISOString(), DIAS_PARA_RECORDATORIO],
  );

  let generados = 0;
  for (const servicio of vencidos) {
    const zona = ciudadPorSlug(servicio.ciudad)?.zona;
    if (!zona) continue;
    const { minutos } = ahoraEn(zona, ahora);
    if (minutos < HORARIO.recordatorioDesde || minutos >= HORARIO.recordatorioHasta) continue;

    generados += await db.transaccion(async (tx) => {
      if (!(await marcar(tx, "recordatorio_en", servicio.id)) || servicio.volvio) return 0;
      await avisar(tx, {
        para: "cliente",
        plantilla: "recordatorio_6_meses",
        variables: [nombreDePila(servicio.cliente_nombre), servicioEnFrase(servicio.tipo)],
        telefono: servicio.cliente_telefono,
        servicioId: servicio.id,
      });
      return 1;
    });
  }
  return generados;
}

/**
 * Genera los avisos que tocan a esta hora. Se puede llamar cuantas veces se quiera: cada aviso sale una sola vez.
 * Regresa cuántos generó.
 */
export async function generarAvisosProgramados(db: Db, ahora = new Date()) {
  const porConfirmar = await db.query<Pendiente>(
    `SELECT id, cliente_nombre, cliente_telefono, ciudad, tipo, fecha::text AS fecha, bloque, estado, proveedor_id,
            to_char(creado_en AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS creado_en,
            confirmacion_noche_en::text AS confirmacion_noche_en, confirmacion_manana_en::text AS confirmacion_manana_en
       FROM servicios
      WHERE estado IN ('agendado', 'tomado')
        AND (confirmacion_noche_en IS NULL OR confirmacion_manana_en IS NULL)
        AND fecha BETWEEN $1::date - 1 AND $1::date + 2
      ORDER BY fecha, bloque, id`,
    [ahora.toISOString().slice(0, 10)],
  );

  let generados = 0;
  for (const servicio of porConfirmar) {
    if (!servicio.confirmacion_noche_en) generados += await confirmar(db, servicio, "noche", ahora);
    if (!servicio.confirmacion_manana_en) generados += await confirmar(db, servicio, "manana", ahora);
  }
  return generados + (await recordar(db, ahora));
}
