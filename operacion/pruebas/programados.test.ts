import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { ahoraEn, sumarDias } from "../shared/fechas.ts";
import type { DatosDeServicio } from "../shared/tipos.ts";
import { abrirDb, type Db } from "../server/db.ts";
import { avisosPendientes } from "../server/repos/avisos.ts";
import { fijarDisponibilidad } from "../server/repos/disponibilidad.ts";
import { generarAvisosProgramados } from "../server/repos/programados.ts";
import { crearProveedor } from "../server/repos/proveedores.ts";
import { agendarServicio, cancelarServicio, marcarRealizado, tomarServicio } from "../server/repos/servicios.ts";

const HOY = ahoraEn("America/Mexico_City").fecha;
/** El día del servicio queda a tres días, para que la cita se haya hecho mucho antes de cualquier aviso. */
const DIA = sumarDias(HOY, 3);
const VISPERA = sumarDias(DIA, -1);
/** Un instante a la hora local dada en Querétaro (UTC-6 todo el año). */
const alas = (fecha: string, hora: number, minuto = 0) =>
  new Date(Date.parse(`${fecha}T00:00:00Z`) + ((hora + 6) * 60 + minuto) * 60_000);

let db: Db;
let proveedorId: number;

beforeEach(async () => {
  db = await abrirDb();
  proveedorId = (await crearProveedor(db, { nombre: "Ana Torres", telefono: "4420000001", ciudades: ["queretaro"] }, "activo")).id;
  for (const bloque of ["b08", "b10", "b12"]) await fijarDisponibilidad(db, proveedorId, DIA, bloque, true);
});
afterEach(() => db.cerrar());

const cita = (cambios: Partial<DatosDeServicio> = {}): DatosDeServicio => ({
  cliente_nombre: "Laura Méndez",
  cliente_telefono: "4421234567",
  ciudad: "queretaro",
  tipo: "tinaco",
  fecha: DIA,
  bloque: "b10",
  ...cambios,
});

const alCliente = async () => (await avisosPendientes(db)).filter((a) => a.para === "cliente");
const aLaCasa = async (motivo: string) => (await avisosPendientes(db)).filter((a) => a.para === "admin" && a.motivo === motivo);

test("el cliente recibe la confirmación la noche anterior y otra en la mañana, una sola vez cada una", async () => {
  const servicio = await agendarServicio(db, cita());
  await tomarServicio(db, servicio.id, proveedorId);

  // Antes de las 7 de la noche de la víspera no sale nada.
  assert.equal(await generarAvisosProgramados(db, alas(VISPERA, 18, 59)), 0);

  assert.equal(await generarAvisosProgramados(db, alas(VISPERA, 19, 1)), 1);
  assert.equal(await generarAvisosProgramados(db, alas(VISPERA, 19, 2)), 0);
  let avisos = await alCliente();
  assert.equal(avisos.length, 1);
  assert.equal(avisos[0]?.motivo, "confirmacion_noche");
  assert.equal(avisos[0]?.telefono, "4421234567");
  assert.match(avisos[0]!.texto, /^Hola Laura, .*su lavado de tinaco de mañana entre 10:00 a\.m\. y 12:00 p\.m\. \(hora aproximada\)\. ¿Nos confirma/);

  // En la mañana del servicio: a partir de las 7 y antes de que empiece su horario.
  assert.equal(await generarAvisosProgramados(db, alas(DIA, 6, 59)), 0);
  assert.equal(await generarAvisosProgramados(db, alas(DIA, 7, 0)), 1);
  assert.equal(await generarAvisosProgramados(db, alas(DIA, 7, 1)), 0);
  avisos = await alCliente();
  assert.deepEqual(avisos.map((a) => a.motivo), ["confirmacion_noche", "confirmacion_manana"]);
  assert.match(avisos[1]!.texto, /^Buenos días Laura, .*es hoy entre 10:00 a\.m\. y 12:00 p\.m\. \(hora aproximada\)\. Le avisamos/);
});

test("al primer servicio del día se le dice su hora fija, sin punto doble", async () => {
  const servicio = await agendarServicio(db, cita({ bloque: "b08" }));
  await tomarServicio(db, servicio.id, proveedorId);

  await generarAvisosProgramados(db, alas(VISPERA, 20));
  await generarAvisosProgramados(db, alas(DIA, 7, 5));
  const textos = (await alCliente()).map((a) => a.texto);
  assert.match(textos[0]!, /de mañana a las 8:00 a\.m\. ¿Nos confirma/);
  assert.match(textos[1]!, /es hoy a las 8:00 a\.m\. Le avisamos/);
});

test("si nadie ha tomado el servicio no se le confirma al cliente y se le avisa a la casa", async () => {
  await agendarServicio(db, cita());

  assert.equal(await generarAvisosProgramados(db, alas(VISPERA, 19, 30)), 1);
  assert.deepEqual(await alCliente(), []);
  const urgentes = await aLaCasa("sin_proveedor_urgente");
  assert.equal(urgentes.length, 1);
  assert.match(urgentes[0]!.texto, /es mañana entre 10:00 a\.m\. y 12:00 p\.m\. \(hora aproximada\) y nadie lo ha tomado/);
});

test("una cita hecha después de la hora del aviso no lo repite", async () => {
  const servicio = await agendarServicio(db, cita());
  await tomarServicio(db, servicio.id, proveedorId);
  // La cita se hizo la víspera a las 8 de la noche: el cliente acaba de hablar con nosotros.
  await db.query("UPDATE servicios SET creado_en = $2 WHERE id = $1", [servicio.id, alas(VISPERA, 20).toISOString()]);

  assert.equal(await generarAvisosProgramados(db, alas(VISPERA, 20, 30)), 0);
  assert.deepEqual(await alCliente(), []);
  // La de la mañana sí le llega.
  assert.equal(await generarAvisosProgramados(db, alas(DIA, 7, 10)), 1);
  assert.deepEqual((await alCliente()).map((a) => a.motivo), ["confirmacion_manana"]);
});

test("un servicio cancelado o que ya pasó su horario no genera confirmaciones", async () => {
  const cancelado = await agendarServicio(db, cita());
  await cancelarServicio(db, cancelado.id, "El cliente canceló");
  const tarde = await agendarServicio(db, cita({ bloque: "b08", cliente_telefono: "4427654321" }));
  await tomarServicio(db, tarde.id, proveedorId);

  // A las 9 el servicio de las 8 ya empezó: la confirmación de la mañana ya no tiene sentido.
  assert.equal(await generarAvisosProgramados(db, alas(DIA, 9)), 0);
  assert.deepEqual(await alCliente(), []);
});

test("a los seis meses se invita al cliente al siguiente lavado, en horas hábiles y sólo si no ha vuelto", async () => {
  const servicio = await agendarServicio(db, cita());
  await tomarServicio(db, servicio.id, proveedorId);
  await marcarRealizado(db, servicio.id, proveedorId);
  const hace = (dias: number) => new Date(Date.now() - dias * 86_400_000).toISOString();

  await db.query("UPDATE servicios SET realizado_en = $2 WHERE id = $1", [servicio.id, hace(179)]);
  assert.equal(await generarAvisosProgramados(db, alas(HOY, 11)), 0);

  await db.query("UPDATE servicios SET realizado_en = $2 WHERE id = $1", [servicio.id, hace(181)]);
  // De noche no se le escribe.
  assert.equal(await generarAvisosProgramados(db, alas(HOY, 21)), 0);
  assert.equal(await generarAvisosProgramados(db, alas(HOY, 11)), 1);
  assert.equal(await generarAvisosProgramados(db, alas(HOY, 12)), 0);
  const [recordatorio] = await alCliente();
  assert.equal(recordatorio?.motivo, "recordatorio_6_meses");
  assert.match(recordatorio!.texto, /^Hola Laura, .*Hace seis meses hicimos su lavado de tinaco/);

  // Otro cliente que ya volvió a agendar no recibe recordatorio de su servicio viejo.
  const viejo = await agendarServicio(db, cita({ cliente_nombre: "Pedro Ruiz", cliente_telefono: "4425550000", bloque: "b12" }));
  await tomarServicio(db, viejo.id, proveedorId);
  await marcarRealizado(db, viejo.id, proveedorId);
  await db.query("UPDATE servicios SET realizado_en = $2 WHERE id = $1", [viejo.id, hace(200)]);
  await agendarServicio(db, cita({ cliente_nombre: "Pedro Ruiz", cliente_telefono: "4425550000", bloque: "b08" }), { forzar: true });
  assert.equal(await generarAvisosProgramados(db, alas(HOY, 13)), 0);
  assert.equal((await alCliente()).length, 1);
});
