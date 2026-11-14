import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { ahoraEn, sumarDias } from "../shared/fechas.ts";
import type { DatosDeServicio } from "../shared/tipos.ts";
import { abrirDb, type Db } from "../server/db.ts";
import { Rechazo } from "../server/lib/rechazo.ts";
import { avisosPendientes } from "../server/repos/avisos.ts";
import { copiarSemana, cupoDe, disponibilidadDe, fijarDisponibilidad, opcionesParaCliente } from "../server/repos/disponibilidad.ts";
import { actualizarProveedor, crearProveedor } from "../server/repos/proveedores.ts";
import {
  agendarServicio, avisarSinProveedor, cancelarServicio, confirmarLiquidacion, eventosDe, marcarEnCamino, marcarRealizado,
  reportarLiquidacion, saldos, serviciosAbiertosPara, serviciosDe, soltarServicio, tomarServicio,
} from "../server/repos/servicios.ts";

const HOY = ahoraEn("America/Mexico_City").fecha;
const MANANA = sumarDias(HOY, 1);
/** Un instante de hoy a la hora local dada en Querétaro (UTC-6 todo el año). */
const hoyALas = (hora: number) => new Date(`${HOY}T${String(hora + 6).padStart(2, "0")}:00:00Z`);

let db: Db;
let telefonos = 0;

beforeEach(async () => {
  db = await abrirDb();
});
afterEach(() => db.cerrar());

async function proveedor(nombre: string, ciudades = ["queretaro"], espacios: [string, string][] = []) {
  const nuevo = await crearProveedor(db, { nombre, telefono: `44200000${String(++telefonos).padStart(2, "0")}`, ciudades }, "activo");
  for (const [fecha, bloque] of espacios) await fijarDisponibilidad(db, nuevo.id, fecha, bloque, true);
  return nuevo;
}

const cita = (cambios: Partial<DatosDeServicio> = {}): DatosDeServicio => ({
  cliente_nombre: "Laura Méndez",
  cliente_telefono: "442 123 4567",
  ciudad: "queretaro",
  colonia: "Juriquilla",
  direccion: "Av. Siempre Viva 12",
  tipo: "tinaco",
  litros: 1100,
  fecha: MANANA,
  bloque: "b10",
  ...cambios,
});

const rechaza = (codigo: string) => (error: unknown) => error instanceof Rechazo && error.codigo === codigo;

test("no se prometen más servicios de los que caben en un horario", async () => {
  await proveedor("Ana", ["queretaro"], [[MANANA, "b10"]]);
  await proveedor("Beto", ["queretaro"], [[MANANA, "b10"]]);
  assert.equal(await cupoDe(db, "queretaro", MANANA, "b10"), 2);

  await agendarServicio(db, cita());
  await agendarServicio(db, cita({ cliente_nombre: "Otro Cliente" }));
  assert.equal(await cupoDe(db, "queretaro", MANANA, "b10"), 0);
  await assert.rejects(agendarServicio(db, cita()), rechaza("sin_cupo"));

  // La casa sí puede agendar a mano un horario sin cupo.
  const forzado = await agendarServicio(db, cita(), { forzar: true, actor: "admin" });
  assert.equal(forzado.estado, "agendado");
});

test("el primero que toma el servicio se lo queda y la comisión queda fija", async () => {
  const ana = await proveedor("Ana", ["queretaro"], [[MANANA, "b10"]]);
  const beto = await proveedor("Beto", ["queretaro"], [[MANANA, "b10"]]);
  const servicio = await agendarServicio(db, cita());

  const [primero, segundo] = await Promise.allSettled([tomarServicio(db, servicio.id, ana.id), tomarServicio(db, servicio.id, beto.id)]);
  assert.equal(primero.status, "fulfilled");
  assert.equal(segundo.status, "rejected");
  assert.ok(rechaza("ya_tomado")((segundo as PromiseRejectedResult).reason));

  const tomado = (primero as PromiseFulfilledResult<Awaited<ReturnType<typeof tomarServicio>>>).value;
  assert.equal(tomado.estado, "tomado");
  assert.equal(tomado.proveedor_nombre, "Ana");
  assert.equal(tomado.comision_pct, 30);
  assert.equal(tomado.comision_monto, 315);

  // Cambiar después la comisión del proveedor no altera lo ya pactado.
  await actualizarProveedor(db, ana.id, { comision_pct: 0 });
  assert.equal((await serviciosDe(db, ana.id))[0]?.comision_monto, 315);
});

test("un proveedor no puede tener dos servicios en el mismo horario", async () => {
  const ana = await proveedor("Ana", ["queretaro"], [[MANANA, "b10"]]);
  await proveedor("Beto", ["queretaro"], [[MANANA, "b10"]]);
  const uno = await agendarServicio(db, cita());
  const dos = await agendarServicio(db, cita({ cliente_nombre: "Segundo Cliente" }));

  await tomarServicio(db, uno.id, ana.id);
  await assert.rejects(tomarServicio(db, dos.id, ana.id), rechaza("ocupado"));
  // Tampoco se le ofrece ya el otro servicio de ese horario.
  assert.deepEqual(await serviciosAbiertosPara(db, ana.id), []);
});

test("sólo toma servicios un proveedor activo y de esa ciudad", async () => {
  await proveedor("Ana", ["queretaro"], [[MANANA, "b10"]]);
  const foraneo = await proveedor("Fernando", ["cdmx"]);
  const suspendido = await proveedor("Saúl");
  await actualizarProveedor(db, suspendido.id, { estado: "suspendido" });
  const servicio = await agendarServicio(db, cita());

  await assert.rejects(tomarServicio(db, servicio.id, foraneo.id), rechaza("fuera_de_zona"));
  await assert.rejects(tomarServicio(db, servicio.id, suspendido.id), rechaza("proveedor_inactivo"));
  assert.deepEqual(await serviciosAbiertosPara(db, foraneo.id), []);
  assert.deepEqual(await serviciosAbiertosPara(db, suspendido.id), []);
});

test("antes de tomarlo, el proveedor no ve el teléfono ni el domicilio del cliente", async () => {
  const ana = await proveedor("Ana", ["queretaro"], [[MANANA, "b10"]]);
  const servicio = await agendarServicio(db, cita());

  const [abierto] = await serviciosAbiertosPara(db, ana.id);
  assert.equal(abierto?.cliente_telefono, "");
  assert.equal(abierto?.direccion, null);
  assert.equal(abierto?.cliente_nombre, "Laura");
  assert.equal(abierto?.colonia, "Juriquilla");

  await tomarServicio(db, servicio.id, ana.id);
  const [mio] = await serviciosDe(db, ana.id);
  assert.equal(mio?.cliente_telefono, "4421234567");
  assert.equal(mio?.direccion, "Av. Siempre Viva 12");
});

test("al cliente se le ofrecen el espacio más cercano y el primero de otro día", async () => {
  await proveedor("Ana", ["queretaro"], [[HOY, "b12"], [HOY, "b14"], [MANANA, "b08"], [MANANA, "b10"]]);

  const temprano = await opcionesParaCliente(db, "queretaro", hoyALas(7), 90);
  assert.deepEqual(temprano.map((o) => [o.fecha, o.bloque]), [[HOY, "b12"], [MANANA, "b08"]]);
  assert.equal(temprano[0]?.texto, "hoy entre 12:00 p.m. y 2:00 p.m. (hora aproximada)");
  assert.equal(temprano[1]?.texto, "mañana a las 8:00 a.m.");

  // A las 11 ya no alcanza la anticipación para el bloque de las 12.
  const masTarde = await opcionesParaCliente(db, "queretaro", hoyALas(11), 90);
  assert.deepEqual(masTarde.map((o) => [o.fecha, o.bloque]), [[HOY, "b14"], [MANANA, "b08"]]);

  assert.deepEqual(await opcionesParaCliente(db, "cdmx", hoyALas(7), 90), []);
});

test("cancelar un servicio devuelve su lugar", async () => {
  const ana = await proveedor("Ana", ["queretaro"], [[MANANA, "b10"]]);
  const servicio = await agendarServicio(db, cita());
  assert.equal(await cupoDe(db, "queretaro", MANANA, "b10"), 0);

  await tomarServicio(db, servicio.id, ana.id);
  assert.equal(await cupoDe(db, "queretaro", MANANA, "b10"), 0);

  await cancelarServicio(db, servicio.id, "El cliente pidió otra fecha");
  assert.equal(await cupoDe(db, "queretaro", MANANA, "b10"), 1);
  const pendientes = await avisosPendientes(db);
  assert.ok(pendientes.some((a) => a.motivo === "servicio_cancelado" && a.proveedor_id === ana.id));
  await assert.rejects(cancelarServicio(db, servicio.id, "otra vez"), rechaza("no_se_puede"));
});

test("del aviso a proveedores hasta la comisión pagada", async () => {
  const ana = await proveedor("Ana", ["queretaro"], [[MANANA, "b10"]]);
  const beto = await proveedor("Beto", ["queretaro"]);
  const servicio = await agendarServicio(db, cita());

  // Se avisa a todos los proveedores activos de la ciudad, hayan marcado o no ese horario.
  let ofertas = (await avisosPendientes(db)).filter((a) => a.motivo === "servicio_nuevo");
  assert.deepEqual(ofertas.map((a) => a.proveedor_id).sort(), [ana.id, beto.id].sort());

  await tomarServicio(db, servicio.id, beto.id);
  ofertas = (await avisosPendientes(db)).filter((a) => a.motivo === "servicio_nuevo");
  assert.deepEqual(ofertas, []);

  await assert.rejects(marcarEnCamino(db, servicio.id, ana.id), rechaza("no_se_puede"));
  await marcarEnCamino(db, servicio.id, beto.id);
  const alCliente = (await avisosPendientes(db)).find((a) => a.para === "cliente");
  assert.equal(alCliente?.telefono, "4421234567");
  assert.match(alCliente!.texto, /va en camino/);

  const realizado = await marcarRealizado(db, servicio.id, beto.id);
  assert.equal(realizado.liquidacion_estado, "pendiente");
  assert.deepEqual((await saldos(db)).map((s) => [s.nombre, s.por_cobrar, s.reportado, s.cobrado]), [["Beto", 315, 0, 0]]);

  await reportarLiquidacion(db, servicio.id, beto.id, "Transferencia BBVA");
  assert.deepEqual((await saldos(db)).map((s) => [s.por_cobrar, s.reportado]), [[315, 315]]);

  await confirmarLiquidacion(db, servicio.id);
  assert.deepEqual((await saldos(db)).map((s) => [s.por_cobrar, s.cobrado]), [[0, 315]]);

  assert.deepEqual((await eventosDe(db, servicio.id)).map((e) => e.tipo),
    ["agendado", "tomado", "en_camino", "realizado", "liquidacion_reportada", "liquidacion_pagada"]);
});

test("con comisión en cero no queda nada por cobrar", async () => {
  const ana = await proveedor("Ana", ["queretaro"], [[MANANA, "b10"]]);
  await actualizarProveedor(db, ana.id, { comision_pct: 0 });
  const servicio = await agendarServicio(db, cita());
  await tomarServicio(db, servicio.id, ana.id);

  const realizado = await marcarRealizado(db, servicio.id, ana.id);
  assert.equal(realizado.comision_monto, 0);
  assert.equal(realizado.liquidacion_estado, "no_aplica");
  await assert.rejects(reportarLiquidacion(db, servicio.id, ana.id), rechaza("no_se_puede"));
});

test("si nadie toma un servicio, se le avisa a la casa una sola vez", async () => {
  await proveedor("Ana", ["queretaro"], [[MANANA, "b10"]]);
  const servicio = await agendarServicio(db, cita());
  assert.equal(await avisarSinProveedor(db, 30), 0);

  await db.query("UPDATE servicios SET creado_en = now() - interval '45 minutes' WHERE id = $1", [servicio.id]);
  assert.equal(await avisarSinProveedor(db, 30), 1);
  assert.equal(await avisarSinProveedor(db, 30), 0);
  assert.ok((await avisosPendientes(db)).some((a) => a.para === "admin" && a.motivo === "sin_proveedor"));
});

test("la casa puede quitarle un servicio a un proveedor y volver a ofrecerlo", async () => {
  const ana = await proveedor("Ana", ["queretaro"], [[MANANA, "b10"]]);
  const beto = await proveedor("Beto", ["queretaro"]);
  const servicio = await agendarServicio(db, cita());
  await tomarServicio(db, servicio.id, ana.id);

  const suelto = await soltarServicio(db, servicio.id);
  assert.equal(suelto.estado, "agendado");
  assert.equal(suelto.proveedor_id, null);
  assert.equal(suelto.comision_monto, null);
  assert.equal((await serviciosAbiertosPara(db, beto.id)).length, 1);
  await tomarServicio(db, servicio.id, beto.id);
});

test("la disponibilidad se marca, se quita y se copia a la semana siguiente", async () => {
  const ana = await proveedor("Ana");
  await fijarDisponibilidad(db, ana.id, HOY, "b08", true);
  await fijarDisponibilidad(db, ana.id, HOY, "b08", true);
  await fijarDisponibilidad(db, ana.id, MANANA, "b14", true);
  await fijarDisponibilidad(db, ana.id, MANANA, "b16", true);
  await fijarDisponibilidad(db, ana.id, MANANA, "b16", false);
  assert.deepEqual(await disponibilidadDe(db, ana.id, HOY, MANANA), [{ fecha: HOY, bloque: "b08" }, { fecha: MANANA, bloque: "b14" }]);

  assert.equal(await copiarSemana(db, ana.id, HOY), 2);
  assert.deepEqual(await disponibilidadDe(db, ana.id, sumarDias(HOY, 7), sumarDias(HOY, 8)),
    [{ fecha: sumarDias(HOY, 7), bloque: "b08" }, { fecha: sumarDias(HOY, 8), bloque: "b14" }]);

  await assert.rejects(fijarDisponibilidad(db, ana.id, "2026-02-31", "b08", true), rechaza("fecha_invalida"));
  await assert.rejects(fijarDisponibilidad(db, ana.id, HOY, "b99", true), rechaza("bloque_invalido"));
});

test("no se registran dos proveedores con el mismo teléfono ni sin ciudad", async () => {
  await crearProveedor(db, { nombre: "Ana López", telefono: "+52 1 442 555 0101", ciudades: ["queretaro"] });
  await assert.rejects(crearProveedor(db, { nombre: "Otra Ana", telefono: "4425550101", ciudades: ["cdmx"] }), rechaza("telefono_repetido"));
  await assert.rejects(crearProveedor(db, { nombre: "Sin Ciudad", telefono: "4425550102", ciudades: [] }), rechaza("sin_ciudad"));
  await assert.rejects(crearProveedor(db, { nombre: "Mal Teléfono", telefono: "12345", ciudades: ["cdmx"] }), rechaza("telefono_invalido"));
});
