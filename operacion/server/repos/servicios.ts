import { etiquetaDeBloque } from "../../shared/bloques.ts";
import { ciudadPorSlug } from "../../shared/ciudades.ts";
import { ahoraEn, fechaCorta } from "../../shared/fechas.ts";
import { montoDeComision, NOMBRE_DE_TIPO, PRECIO_BASE, TIPOS_DE_SERVICIO } from "../../shared/precios.ts";
import { normalizarTelefono } from "../../shared/telefono.ts";
import type { DatosDeServicio, EventoDeServicio, Saldo, Servicio } from "../../shared/tipos.ts";
import { config } from "../config.ts";
import type { Consulta, Db } from "../db.ts";
import { Rechazo } from "../lib/rechazo.ts";
import { iso } from "../lib/sql.ts";
import { avisar, avisarALaCasa, descartarOfertas } from "./avisos.ts";
import { cupoDe, validarEspacio } from "./disponibilidad.ts";

const COLUMNAS = `s.id, s.cliente_nombre, s.cliente_telefono, s.ciudad, s.colonia, s.direccion, s.tipo, s.litros, s.precio,
  s.fecha::text AS fecha, s.bloque, s.estado, s.proveedor_id, p.nombre AS proveedor_nombre,
  ${iso("s.tomado_en")}, ${iso("s.en_camino_en")}, ${iso("s.realizado_en")}, ${iso("s.cancelado_en")}, s.motivo_cancelacion,
  s.comision_pct, s.comision_monto, s.liquidacion_estado, s.liquidacion_nota, s.origen, s.notas, ${iso("s.creado_en")}`;

const DESDE = "FROM servicios s LEFT JOIN proveedores p ON p.id = s.proveedor_id";

export async function obtenerServicio(q: Consulta, id: number) {
  const [servicio] = await q.query<Servicio>(`SELECT ${COLUMNAS} ${DESDE} WHERE s.id = $1`, [id]);
  return servicio;
}

const anotar = (q: Consulta, servicioId: number, tipo: string, actor: string, detalle?: string | null) =>
  q.query("INSERT INTO servicio_eventos (servicio_id, tipo, actor, detalle) VALUES ($1, $2, $3, $4)", [servicioId, tipo, actor, detalle ?? null]);

export const eventosDe = (q: Consulta, servicioId: number) =>
  q.query<EventoDeServicio>(`SELECT tipo, actor, detalle, ${iso("creado_en")} FROM servicio_eventos WHERE servicio_id = $1 ORDER BY id`, [servicioId]);

/** El horario termina en "a.m." o "p.m.": no se le pone otro punto encima. */
const conPunto = (frase: string) => (frase.endsWith(".") ? frase : `${frase}.`);

const resumen = (s: Pick<Servicio, "tipo" | "litros" | "ciudad" | "colonia" | "fecha" | "bloque">) =>
  `${NOMBRE_DE_TIPO[s.tipo]}${s.litros ? ` de ${s.litros.toLocaleString("es-MX")} L` : ""} en ${ciudadPorSlug(s.ciudad)?.nombre ?? s.ciudad}` +
  `${s.colonia ? `, ${s.colonia}` : ""}. ${fechaCorta(s.fecha)}, ${etiquetaDeBloque(s.bloque)}`;

/** Le avisa del servicio a cada proveedor activo de la ciudad que no esté ocupado en ese bloque. */
async function ofrecer(q: Consulta, servicio: Servicio) {
  const candidatos = await q.query<{ id: number; telefono: string }>(
    `SELECT p.id, p.telefono FROM proveedores p
       JOIN proveedor_ciudades pc ON pc.proveedor_id = p.id AND pc.ciudad = $1
      WHERE p.estado = 'activo'
        AND NOT EXISTS (SELECT 1 FROM servicios o WHERE o.proveedor_id = p.id AND o.fecha = $2 AND o.bloque = $3 AND o.estado <> 'cancelado')`,
    [servicio.ciudad, servicio.fecha, servicio.bloque],
  );
  for (const candidato of candidatos) {
    await avisar(q, {
      para: "proveedor",
      plantilla: "servicio_nuevo",
      variables: [conPunto(resumen(servicio)), `${servicio.precio.toLocaleString("es-MX")}`, `${config.urlPublica}/proveedor`],
      telefono: candidato.telefono,
      servicioId: servicio.id,
      proveedorId: candidato.id,
    });
  }
  return candidatos.length;
}

/**
 * Agenda un servicio con el cliente. Se hace en el momento, sin preguntarle a nadie: el horario tiene que tener cupo.
 * `forzar` es para que la casa agende a mano un horario sin cupo (por ejemplo, ya arreglado por fuera con un proveedor).
 */
export async function agendarServicio(db: Db, datos: DatosDeServicio, opciones: { forzar?: boolean; actor?: string; ahora?: Date } = {}) {
  const ciudad = ciudadPorSlug(datos.ciudad);
  if (!ciudad) throw new Rechazo("ciudad_desconocida", "No trabajamos en esa ciudad.", 400);
  validarEspacio(datos.fecha, datos.bloque);
  if (datos.fecha < ahoraEn(ciudad.zona, opciones.ahora).fecha) throw new Rechazo("fecha_pasada", "Esa fecha ya pasó.", 400);
  if (!TIPOS_DE_SERVICIO.includes(datos.tipo)) throw new Rechazo("tipo_invalido", "Ese tipo de servicio no existe.", 400);

  const telefono = normalizarTelefono(datos.cliente_telefono);
  if (!telefono) throw new Rechazo("telefono_invalido", "El teléfono del cliente debe tener 10 dígitos.", 400);
  const nombre = datos.cliente_nombre.trim();
  if (!nombre) throw new Rechazo("nombre_invalido", "Falta el nombre del cliente.", 400);
  const precio = datos.precio ?? PRECIO_BASE[datos.tipo];
  if (!Number.isInteger(precio) || precio < 0) throw new Rechazo("precio_invalido", "El precio no es válido.", 400);

  return db.transaccion(async (tx) => {
    // Dos conversaciones a la vez no pueden quedarse con el último lugar del mismo bloque.
    await tx.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${datos.ciudad}|${datos.fecha}|${datos.bloque}`]);
    if (!opciones.forzar && (await cupoDe(tx, datos.ciudad, datos.fecha, datos.bloque)) <= 0) {
      throw new Rechazo("sin_cupo", "Ese horario ya no tiene lugar. Ofrece otro.");
    }

    const [nuevo] = await tx.query<{ id: number }>(
      `INSERT INTO servicios (cliente_nombre, cliente_telefono, ciudad, colonia, direccion, tipo, litros, precio, fecha, bloque, origen, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [nombre, telefono, datos.ciudad, datos.colonia?.trim() || null, datos.direccion?.trim() || null, datos.tipo, datos.litros ?? null,
        precio, datos.fecha, datos.bloque, datos.origen ?? "panel", datos.notas?.trim() || null],
    );
    const servicio = (await obtenerServicio(tx, nuevo!.id))!;
    const avisados = await ofrecer(tx, servicio);
    await anotar(tx, servicio.id, "agendado", opciones.actor ?? "sistema", `Se avisó a ${avisados} proveedor(es)${opciones.forzar ? "; agendado sin revisar cupo" : ""}`);
    return servicio;
  });
}

const esChoqueDeBloque = (error: unknown) =>
  (error as { code?: string }).code === "23505" || String((error as Error).message).includes("servicios_un_bloque_por_proveedor");

/** El primero que lo toma se lo queda. A partir de aquí el servicio tiene candado. */
export async function tomarServicio(db: Db, servicioId: number, proveedorId: number) {
  return db.transaccion(async (tx) => {
    const [proveedor] = await tx.query<{ estado: string; comision_pct: number }>("SELECT estado, comision_pct FROM proveedores WHERE id = $1", [proveedorId]);
    if (proveedor?.estado !== "activo") throw new Rechazo("proveedor_inactivo", "Tu cuenta no está activa.", 403);

    const [servicio] = await tx.query<{ ciudad: string; fecha: string; bloque: string; precio: number }>(
      "SELECT ciudad, fecha::text AS fecha, bloque, precio FROM servicios WHERE id = $1 FOR UPDATE",
      [servicioId],
    );
    if (!servicio) throw new Rechazo("no_existe", "Ese servicio no existe.", 404);

    const [cubre] = await tx.query("SELECT 1 FROM proveedor_ciudades WHERE proveedor_id = $1 AND ciudad = $2", [proveedorId, servicio.ciudad]);
    if (!cubre) throw new Rechazo("fuera_de_zona", "Ese servicio es de una ciudad que no atiendes.", 403);

    const [ocupado] = await tx.query(
      "SELECT 1 FROM servicios WHERE proveedor_id = $1 AND fecha = $2 AND bloque = $3 AND estado <> 'cancelado'",
      [proveedorId, servicio.fecha, servicio.bloque],
    );
    if (ocupado) throw new Rechazo("ocupado", "Ya tienes un servicio en ese horario.");

    let tomados: unknown[];
    try {
      tomados = await tx.query(
        `UPDATE servicios SET proveedor_id = $2, estado = 'tomado', tomado_en = now(), comision_pct = $3, comision_monto = $4
          WHERE id = $1 AND proveedor_id IS NULL AND estado = 'agendado' RETURNING id`,
        [servicioId, proveedorId, proveedor.comision_pct, montoDeComision(servicio.precio, proveedor.comision_pct)],
      );
    } catch (error) {
      if (esChoqueDeBloque(error)) throw new Rechazo("ocupado", "Ya tienes un servicio en ese horario.");
      throw error;
    }
    if (tomados.length === 0) throw new Rechazo("ya_tomado", "Otro proveedor ya tomó este servicio.");

    await descartarOfertas(tx, servicioId);
    await anotar(tx, servicioId, "tomado", `proveedor:${proveedorId}`);
    return (await obtenerServicio(tx, servicioId))!;
  });
}

/** El proveedor avisa que va para allá y el sistema se lo dice al cliente. */
export async function marcarEnCamino(db: Db, servicioId: number, proveedorId: number) {
  return db.transaccion(async (tx) => {
    const filas = await tx.query(
      "UPDATE servicios SET estado = 'en_camino', en_camino_en = now() WHERE id = $1 AND proveedor_id = $2 AND estado = 'tomado' RETURNING id",
      [servicioId, proveedorId],
    );
    if (filas.length === 0) throw new Rechazo("no_se_puede", "Ese servicio no está listo para marcarse en camino.");
    const servicio = (await obtenerServicio(tx, servicioId))!;
    await avisar(tx, {
      para: "cliente",
      plantilla: "en_camino",
      variables: [servicio.cliente_nombre.trim().split(/s+/)[0] ?? servicio.cliente_nombre],
      telefono: servicio.cliente_telefono,
      servicioId,
    });
    await anotar(tx, servicioId, "en_camino", `proveedor:${proveedorId}`);
    return servicio;
  });
}

export async function marcarRealizado(db: Db, servicioId: number, proveedorId: number) {
  return db.transaccion(async (tx) => {
    const filas = await tx.query(
      `UPDATE servicios SET estado = 'realizado', realizado_en = now(),
              liquidacion_estado = CASE WHEN COALESCE(comision_monto, 0) > 0 THEN 'pendiente' ELSE 'no_aplica' END
        WHERE id = $1 AND proveedor_id = $2 AND estado IN ('tomado', 'en_camino') RETURNING id`,
      [servicioId, proveedorId],
    );
    if (filas.length === 0) throw new Rechazo("no_se_puede", "Ese servicio no se puede marcar como terminado.");
    await anotar(tx, servicioId, "realizado", `proveedor:${proveedorId}`);
    return (await obtenerServicio(tx, servicioId))!;
  });
}

/** El proveedor dice que ya transfirió la comisión; la casa lo confirma después. */
export async function reportarLiquidacion(db: Db, servicioId: number, proveedorId: number, nota?: string | null) {
  return db.transaccion(async (tx) => {
    const filas = await tx.query(
      `UPDATE servicios SET liquidacion_estado = 'reportada', liquidacion_reportada_en = now(), liquidacion_nota = $3
        WHERE id = $1 AND proveedor_id = $2 AND estado = 'realizado' AND liquidacion_estado = 'pendiente' RETURNING id`,
      [servicioId, proveedorId, nota?.trim() || null],
    );
    if (filas.length === 0) throw new Rechazo("no_se_puede", "Ese servicio no tiene una comisión pendiente.");
    await anotar(tx, servicioId, "liquidacion_reportada", `proveedor:${proveedorId}`, nota);
    return (await obtenerServicio(tx, servicioId))!;
  });
}

export async function confirmarLiquidacion(db: Db, servicioId: number) {
  return db.transaccion(async (tx) => {
    const filas = await tx.query(
      `UPDATE servicios SET liquidacion_estado = 'pagada', liquidacion_pagada_en = now()
        WHERE id = $1 AND estado = 'realizado' AND liquidacion_estado IN ('pendiente', 'reportada') RETURNING id`,
      [servicioId],
    );
    if (filas.length === 0) throw new Rechazo("no_se_puede", "Ese servicio no tiene una comisión por cobrar.");
    await anotar(tx, servicioId, "liquidacion_pagada", "admin");
    return (await obtenerServicio(tx, servicioId))!;
  });
}

export async function cancelarServicio(db: Db, servicioId: number, motivo: string) {
  return db.transaccion(async (tx) => {
    const antes = await obtenerServicio(tx, servicioId);
    const filas = await tx.query(
      "UPDATE servicios SET estado = 'cancelado', cancelado_en = now(), motivo_cancelacion = $2 WHERE id = $1 AND estado NOT IN ('realizado', 'cancelado') RETURNING id",
      [servicioId, motivo.trim() || null],
    );
    if (!antes || filas.length === 0) throw new Rechazo("no_se_puede", "Ese servicio ya no se puede cancelar.");

    await descartarOfertas(tx, servicioId);
    if (antes.proveedor_id) {
      const [proveedor] = await tx.query<{ telefono: string }>("SELECT telefono FROM proveedores WHERE id = $1", [antes.proveedor_id]);
      await avisar(tx, {
        para: "proveedor",
        plantilla: "servicio_cancelado",
        variables: [conPunto(resumen(antes))],
        telefono: proveedor?.telefono,
        servicioId,
        proveedorId: antes.proveedor_id,
      });
    }
    await anotar(tx, servicioId, "cancelado", "admin", motivo);
    return (await obtenerServicio(tx, servicioId))!;
  });
}

/** La casa le quita el servicio a quien lo tenía y lo vuelve a ofrecer a todos. */
export async function soltarServicio(db: Db, servicioId: number) {
  return db.transaccion(async (tx) => {
    const antes = await obtenerServicio(tx, servicioId);
    const filas = await tx.query(
      `UPDATE servicios SET estado = 'agendado', proveedor_id = NULL, tomado_en = NULL, en_camino_en = NULL,
              comision_pct = NULL, comision_monto = NULL, sin_proveedor_avisado_en = NULL
        WHERE id = $1 AND estado IN ('tomado', 'en_camino') RETURNING id`,
      [servicioId],
    );
    if (!antes || filas.length === 0) throw new Rechazo("no_se_puede", "Ese servicio no tiene proveedor que quitar.");
    const servicio = (await obtenerServicio(tx, servicioId))!;
    const avisados = await ofrecer(tx, servicio);
    await anotar(tx, servicioId, "soltado", "admin", `Lo tenía ${antes.proveedor_nombre}; se avisó a ${avisados} proveedor(es)`);
    return servicio;
  });
}

/** Si pasa el plazo y nadie toma un servicio, se le avisa a la casa una sola vez. Regresa cuántos avisó. */
export async function avisarSinProveedor(db: Db, minutos: number) {
  return db.transaccion(async (tx) => {
    const rezagados = await tx.query<{ id: number }>(
      `UPDATE servicios SET sin_proveedor_avisado_en = now()
        WHERE estado = 'agendado' AND proveedor_id IS NULL AND sin_proveedor_avisado_en IS NULL
          AND creado_en < now() - make_interval(mins => $1) RETURNING id`,
      [minutos],
    );
    for (const { id } of rezagados) {
      const servicio = (await obtenerServicio(tx, id))!;
      await avisarALaCasa(
        tx,
        "sin_proveedor",
        `Nadie ha tomado el servicio #${id}: ${resumen(servicio)} (${servicio.cliente_nombre}). Hay que conseguir quién lo atienda o avisarle al cliente.`,
        { servicioId: id },
      );
      await anotar(tx, id, "sin_proveedor", "sistema", `Pasaron ${minutos} minutos sin que nadie lo tomara`);
    }
    return rezagados.length;
  });
}

export interface FiltroDeServicios {
  estado?: string;
  desde?: string;
  hasta?: string;
}

export function listarServicios(q: Consulta, filtro: FiltroDeServicios = {}) {
  return q.query<Servicio>(
    `SELECT ${COLUMNAS} ${DESDE}
      WHERE ($1::text IS NULL OR s.estado = $1) AND ($2::date IS NULL OR s.fecha >= $2) AND ($3::date IS NULL OR s.fecha <= $3)
      ORDER BY s.fecha DESC, s.bloque DESC, s.id DESC LIMIT 500`,
    [filtro.estado ?? null, filtro.desde ?? null, filtro.hasta ?? null],
  );
}

/** Servicios que este proveedor puede tomar. Sin teléfono ni domicilio del cliente: eso se ve hasta tomarlo. */
export async function serviciosAbiertosPara(q: Consulta, proveedorId: number) {
  const abiertos = await q.query<Servicio>(
    `SELECT ${COLUMNAS} ${DESDE}
       JOIN proveedor_ciudades pc ON pc.ciudad = s.ciudad AND pc.proveedor_id = $1
       JOIN proveedores yo ON yo.id = $1 AND yo.estado = 'activo'
      WHERE s.estado = 'agendado' AND s.proveedor_id IS NULL AND s.fecha >= current_date - 1
        AND NOT EXISTS (SELECT 1 FROM servicios o WHERE o.proveedor_id = $1 AND o.fecha = s.fecha AND o.bloque = s.bloque AND o.estado <> 'cancelado')
      ORDER BY s.fecha, s.bloque, s.id`,
    [proveedorId],
  );
  return abiertos.map((servicio) => ({ ...servicio, cliente_nombre: servicio.cliente_nombre.split(" ")[0]!, cliente_telefono: "", direccion: null }));
}

export const serviciosDe = (q: Consulta, proveedorId: number) =>
  q.query<Servicio>(
    `SELECT ${COLUMNAS} ${DESDE}
      WHERE s.proveedor_id = $1 AND s.estado <> 'cancelado' AND s.fecha >= current_date - 60
      ORDER BY (s.estado = 'realizado'), s.fecha, s.bloque`,
    [proveedorId],
  );

/** Cuánto le debe cada proveedor a la casa por servicios ya terminados. */
export const saldos = (q: Consulta) =>
  q.query<Saldo>(
    `SELECT p.id AS proveedor_id, p.nombre, p.telefono, p.liquidacion,
            count(s.id)::int AS servicios_realizados,
            COALESCE(sum(s.comision_monto) FILTER (WHERE s.liquidacion_estado IN ('pendiente', 'reportada')), 0)::int AS por_cobrar,
            COALESCE(sum(s.comision_monto) FILTER (WHERE s.liquidacion_estado = 'reportada'), 0)::int AS reportado,
            COALESCE(sum(s.comision_monto) FILTER (WHERE s.liquidacion_estado = 'pagada'), 0)::int AS cobrado
       FROM proveedores p
       JOIN servicios s ON s.proveedor_id = p.id AND s.estado = 'realizado'
      GROUP BY p.id
      ORDER BY por_cobrar DESC, p.nombre`,
  );

