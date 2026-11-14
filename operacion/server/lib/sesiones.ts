import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Consulta } from "../db.ts";

export const DIAS_DE_SESION = 60;
export const DIAS_DE_ACCESO = 7;

const huellaDe = (secreto: string) => createHash("sha256").update(secreto).digest("hex");
const secretoNuevo = () => randomBytes(32).toString("base64url");

export interface Sesion {
  tipo: "admin" | "proveedor";
  proveedorId: number | null;
}

/** Abre una sesión y regresa el secreto que va en la cookie; en la base sólo queda su huella. */
export async function abrirSesion(q: Consulta, tipo: Sesion["tipo"], proveedorId: number | null = null) {
  const secreto = secretoNuevo();
  await q.query("INSERT INTO sesiones (huella, tipo, proveedor_id, expira_en) VALUES ($1, $2, $3, now() + make_interval(days => $4))", [
    huellaDe(secreto), tipo, proveedorId, DIAS_DE_SESION,
  ]);
  return secreto;
}

export async function leerSesion(q: Consulta, secreto: string | undefined): Promise<Sesion | undefined> {
  if (!secreto) return undefined;
  const [sesion] = await q.query<{ tipo: Sesion["tipo"]; proveedor_id: number | null }>(
    "SELECT tipo, proveedor_id FROM sesiones WHERE huella = $1 AND expira_en > now()",
    [huellaDe(secreto)],
  );
  return sesion && { tipo: sesion.tipo, proveedorId: sesion.proveedor_id };
}

export const cerrarSesion = (q: Consulta, secreto: string) => q.query("DELETE FROM sesiones WHERE huella = $1", [huellaDe(secreto)]);

/** Enlace de un solo uso con el que un proveedor entra sin contraseña. */
export async function crearAcceso(q: Consulta, proveedorId: number) {
  const secreto = secretoNuevo();
  await q.query("INSERT INTO accesos (huella, proveedor_id, expira_en) VALUES ($1, $2, now() + make_interval(days => $3))", [
    huellaDe(secreto), proveedorId, DIAS_DE_ACCESO,
  ]);
  return secreto;
}

export async function canjearAcceso(q: Consulta, secreto: string) {
  const [acceso] = await q.query<{ proveedor_id: number }>(
    "UPDATE accesos SET usado_en = now() WHERE huella = $1 AND usado_en IS NULL AND expira_en > now() RETURNING proveedor_id",
    [huellaDe(secreto)],
  );
  return acceso?.proveedor_id;
}

/** Compara dos claves sin revelar por el tiempo de respuesta cuánto se parecen. */
export const mismaClave = (intento: string, esperada: string) =>
  timingSafeEqual(Buffer.from(huellaDe(intento), "hex"), Buffer.from(huellaDe(esperada), "hex"));
