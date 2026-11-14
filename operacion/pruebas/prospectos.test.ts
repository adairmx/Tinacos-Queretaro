import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { ahoraEn, sumarDias } from "../shared/fechas.ts";
import type { Db } from "../server/db.ts";

process.env.ADMIN_PASSWORD = "clave-solo-de-prueba";
process.env.CLAVE_DEL_SITIO = "clave-del-sitio-de-prueba";

const MANANA = sumarDias(ahoraEn("America/Mexico_City").fecha, 1);

let db: Db;
let base: string;
let cerrar: () => void;
let prospectos: typeof import("../server/repos/prospectos.ts");

before(async () => {
  const { abrirDb } = await import("../server/db.ts");
  const { crearApp } = await import("../server/app.ts");
  prospectos = await import("../server/repos/prospectos.ts");
  db = await abrirDb();
  const servidor = crearApp(db).listen(0);
  base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;
  cerrar = () => servidor.close();
});
after(async () => {
  cerrar();
  await db.cerrar();
});

async function pedir(metodo: string, ruta: string, cuerpo?: unknown, encabezados: Record<string, string> = {}) {
  const respuesta = await fetch(base + ruta, {
    method: metodo,
    headers: { ...(cuerpo ? { "Content-Type": "application/json" } : {}), ...encabezados },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  return { status: respuesta.status, datos: (await respuesta.json()) as any, cookie: respuesta.headers.get("set-cookie")?.split(";")[0] ?? "" };
}

const delSitio = { "X-Clave-Del-Sitio": "clave-del-sitio-de-prueba" };
/** Lo que manda hoy el formulario de contacto de lavadotinacos.com. */
const formulario = { nombre: "Laura Méndez", telefono: "442 123 4567", ciudad: "Por confirmar", tipo: "tinaco", notas: "¿Cuánto cuesta para 1100 litros?", origen: "web_contacto" };

test("la ciudad y el tipo de servicio se reconocen aunque vengan escritos a mano", () => {
  const { ciudadDeTexto, tipoDeTexto } = prospectos;
  assert.equal(ciudadDeTexto("Querétaro"), "queretaro");
  assert.equal(ciudadDeTexto("CDMX"), "cdmx");
  assert.equal(ciudadDeTexto("Ciudad de México (CDMX)"), "cdmx");
  assert.equal(ciudadDeTexto("guadalajara"), "guadalajara");
  assert.equal(ciudadDeTexto("San Luis Potosí"), "san-luis-potosi");
  assert.equal(ciudadDeTexto("Cancún y Riviera Maya"), "cancun");
  assert.equal(ciudadDeTexto("Por confirmar"), undefined);
  assert.equal(ciudadDeTexto(""), undefined);

  assert.equal(tipoDeTexto("Lavado de Cisterna"), "cisterna");
  assert.equal(tipoDeTexto("ambos"), "ambos");
  assert.equal(tipoDeTexto("Paquete tinaco y cisterna"), "ambos");
  assert.equal(tipoDeTexto(undefined), "tinaco");
  assert.equal(tipoDeTexto("impermeabilización"), "otro");
});

test("sólo el sitio puede dejar leads, y la conexión se puede probar sin guardar nada", async () => {
  assert.equal((await pedir("POST", "/api/prospectos", formulario)).status, 401);
  assert.equal((await pedir("POST", "/api/prospectos", formulario, { "X-Clave-Del-Sitio": "otra" })).status, 401);

  const prueba = await pedir("POST", "/api/prospectos", formulario, { ...delSitio, "X-Solo-Probar": "1" });
  assert.deepEqual([prueba.status, prueba.datos], [200, { ok: true, prueba: true }]);
  assert.deepEqual(await db.query("SELECT id FROM prospectos"), []);

  // Sin teléfono no hay a quién llamarle.
  assert.equal((await pedir("POST", "/api/prospectos", { ...formulario, telefono: "123" }, delSitio)).status, 400);
});

test("un lead del sitio llega a la bandeja, no se duplica y termina en cita", async () => {
  const admin = await pedir("POST", "/api/admin/entrar", { clave: "clave-solo-de-prueba" });
  const sesion = { Cookie: admin.cookie };

  const llegada = await pedir("POST", "/api/prospectos", formulario, delSitio);
  assert.equal(llegada.status, 201);
  assert.equal(llegada.datos.repetido, false);
  const id = llegada.datos.id;

  // La misma persona vuelve a escribir: se le suma al lead abierto.
  const otraVez = await pedir("POST", "/api/prospectos", { ...formulario, telefono: "+52 1 4421234567", ciudad: "Querétaro", notas: "Es para mañana" }, delSitio);
  assert.deepEqual([otraVez.status, otraVez.datos.id, otraVez.datos.repetido], [200, id, true]);

  const bandeja = (await pedir("GET", "/api/admin/prospectos", undefined, sesion)).datos;
  assert.equal(bandeja.length, 1);
  assert.equal(bandeja[0].telefono, "4421234567");
  assert.equal(bandeja[0].telefono_valido, true);
  assert.equal(bandeja[0].ciudad, "queretaro");
  assert.equal(bandeja[0].estado, "nuevo");
  assert.equal(bandeja[0].notas, "¿Cuánto cuesta para 1100 litros?\n— Volvió a escribir —\nEs para mañana");

  // A la casa se le avisa una sola vez.
  const avisos = (await pedir("GET", "/api/admin/avisos", undefined, sesion)).datos.filter((a: any) => a.motivo === "lead_nuevo");
  assert.equal(avisos.length, 1);
  assert.equal(avisos[0].texto, "Lead nuevo: Laura Méndez, 442 123 4567. Lavado de tinaco. Dice: «¿Cuánto cuesta para 1100 litros?»");

  // Sin sesión de administración no se ve la bandeja.
  assert.equal((await pedir("GET", "/api/admin/prospectos")).status, 401);

  assert.equal((await pedir("POST", `/api/admin/prospectos/${id}`, { estado: "contactado" }, sesion)).datos.estado, "contactado");

  // Se agenda desde el lead: queda ligado al servicio y sale de los pendientes.
  const cita = { cliente_nombre: "Laura Méndez", cliente_telefono: "4421234567", ciudad: "queretaro", tipo: "tinaco", fecha: MANANA, bloque: "b10", forzar: true, origen: "web_contacto", prospecto_id: id };
  const servicio = await pedir("POST", "/api/admin/servicios", cita, sesion);
  assert.equal(servicio.status, 201);
  assert.equal(servicio.datos.origen, "web_contacto");
  const agendado = (await pedir("GET", `/api/admin/prospectos/${id}`, undefined, sesion)).datos;
  assert.deepEqual([agendado.estado, agendado.servicio_id], ["agendado", servicio.datos.id]);

  // Ya con cita, no se puede descartar; y un lead nuevo de esa persona abre otro renglón.
  assert.equal((await pedir("POST", `/api/admin/prospectos/${id}`, { estado: "descartado" }, sesion)).status, 409);
  const nuevo = await pedir("POST", "/api/prospectos", formulario, delSitio);
  assert.deepEqual([nuevo.status, nuevo.datos.repetido], [201, false]);
  const descartado = await pedir("POST", `/api/admin/prospectos/${nuevo.datos.id}`, { estado: "descartado", motivo: "Sólo quería precios" }, sesion);
  assert.deepEqual([descartado.datos.estado, descartado.datos.motivo_descarte], ["descartado", "Sólo quería precios"]);
});

test("un teléfono raro se guarda igual, marcado para revisarlo", async () => {
  const { prospecto } = await prospectos.recibirProspecto(db, { nombre: "", telefono: "442-123-45", ciudad: "Atlántida", tipo: "Cisterna grande" });
  assert.equal(prospecto.nombre, "Sin nombre");
  assert.equal(prospecto.telefono_valido, false);
  assert.equal(prospecto.telefono, "442-123-45");
  assert.equal(prospecto.ciudad, null);
  assert.equal(prospecto.tipo, "cisterna");
});
