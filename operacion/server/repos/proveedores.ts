import { ciudadPorSlug } from "../../shared/ciudades.ts";
import { normalizarTelefono } from "../../shared/telefono.ts";
import { PROTOCOLOS_VERSION, type DatosDeProveedor, type EstadoDeProveedor, type ModoDeLiquidacion, type Proveedor } from "../../shared/tipos.ts";
import type { Consulta, Db } from "../db.ts";
import { Rechazo } from "../lib/rechazo.ts";
import { iso } from "../lib/sql.ts";

const COLUMNAS = `p.id, p.nombre, p.telefono, p.estado, p.comision_pct, p.liquidacion, p.equipo, p.experiencia, p.notas,
  p.protocolos_version, ${iso("p.protocolos_aceptados_en")}, ${iso("p.creado_en")},
  COALESCE((SELECT array_agg(pc.ciudad ORDER BY pc.ciudad) FROM proveedor_ciudades pc WHERE pc.proveedor_id = p.id), '{}') AS ciudades`;

export const listarProveedores = (q: Consulta) =>
  q.query<Proveedor>(`SELECT ${COLUMNAS} FROM proveedores p ORDER BY (p.estado = 'pendiente') DESC, p.nombre`);

export async function obtenerProveedor(q: Consulta, id: number) {
  const [proveedor] = await q.query<Proveedor>(`SELECT ${COLUMNAS} FROM proveedores p WHERE p.id = $1`, [id]);
  return proveedor;
}

function ciudadesValidas(ciudades: string[]) {
  const unicas = [...new Set(ciudades)];
  if (unicas.length === 0) throw new Rechazo("sin_ciudad", "Elige al menos una ciudad.", 400);
  for (const slug of unicas) {
    if (!ciudadPorSlug(slug)) throw new Rechazo("ciudad_desconocida", `No trabajamos en "${slug}".`, 400);
  }
  return unicas;
}

async function guardarCiudades(q: Consulta, proveedorId: number, ciudades: string[]) {
  await q.query("DELETE FROM proveedor_ciudades WHERE proveedor_id = $1", [proveedorId]);
  for (const ciudad of ciudades) {
    await q.query("INSERT INTO proveedor_ciudades (proveedor_id, ciudad) VALUES ($1, $2)", [proveedorId, ciudad]);
  }
}

/** Alta de un proveedor. Quien se registra solo queda pendiente; al que da de alta la casa se le puede activar de una vez. */
export async function crearProveedor(db: Db, datos: DatosDeProveedor, estado: EstadoDeProveedor = "pendiente") {
  const telefono = normalizarTelefono(datos.telefono);
  if (!telefono) throw new Rechazo("telefono_invalido", "El teléfono debe tener 10 dígitos.", 400);
  const nombre = datos.nombre.trim();
  if (nombre.length < 3) throw new Rechazo("nombre_invalido", "Escribe el nombre completo.", 400);
  const ciudades = ciudadesValidas(datos.ciudades);

  return db.transaccion(async (tx) => {
    const [existente] = await tx.query("SELECT id FROM proveedores WHERE telefono = $1", [telefono]);
    if (existente) throw new Rechazo("telefono_repetido", "Ya hay un proveedor registrado con ese teléfono.");

    const [nuevo] = await tx.query<{ id: number }>(
      "INSERT INTO proveedores (nombre, telefono, estado, equipo, experiencia) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [nombre, telefono, estado, datos.equipo?.trim() || null, datos.experiencia?.trim() || null],
    );
    await guardarCiudades(tx, nuevo!.id, ciudades);
    return (await obtenerProveedor(tx, nuevo!.id))!;
  });
}

export interface CambiosDeProveedor {
  nombre?: string;
  estado?: EstadoDeProveedor;
  comision_pct?: number;
  liquidacion?: ModoDeLiquidacion;
  notas?: string | null;
  ciudades?: string[];
}

export async function actualizarProveedor(db: Db, id: number, cambios: CambiosDeProveedor) {
  return db.transaccion(async (tx) => {
    const filas = await tx.query(
      `UPDATE proveedores SET
         nombre = COALESCE($2, nombre), estado = COALESCE($3, estado), comision_pct = COALESCE($4, comision_pct),
         liquidacion = COALESCE($5, liquidacion), notas = CASE WHEN $6 THEN $7 ELSE notas END
       WHERE id = $1 RETURNING id`,
      [id, cambios.nombre?.trim() || null, cambios.estado ?? null, cambios.comision_pct ?? null, cambios.liquidacion ?? null,
        cambios.notas !== undefined, cambios.notas?.trim() || null],
    );
    if (filas.length === 0) throw new Rechazo("no_existe", "Ese proveedor no existe.", 404);
    if (cambios.ciudades) await guardarCiudades(tx, id, ciudadesValidas(cambios.ciudades));
    // Un proveedor suspendido pierde sus sesiones abiertas.
    if (cambios.estado === "suspendido") await tx.query("DELETE FROM sesiones WHERE proveedor_id = $1", [id]);
    return (await obtenerProveedor(tx, id))!;
  });
}

export async function aceptarProtocolos(q: Consulta, id: number) {
  await q.query("UPDATE proveedores SET protocolos_version = $2, protocolos_aceptados_en = now() WHERE id = $1", [id, PROTOCOLOS_VERSION]);
}
