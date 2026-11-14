import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { ahoraEn, sumarDias } from "../shared/fechas.ts";
import type { Db } from "../server/db.ts";

process.env.ADMIN_PASSWORD = "clave-solo-de-prueba";
process.env.URL_PUBLICA = "https://plataforma.test";

const MANANA = sumarDias(ahoraEn("America/Mexico_City").fecha, 1);

let db: Db;
let base: string;
let cerrar: () => void;

before(async () => {
  const { abrirDb } = await import("../server/db.ts");
  const { crearApp } = await import("../server/app.ts");
  db = await abrirDb();
  const servidor = crearApp(db).listen(0);
  base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;
  cerrar = () => servidor.close();
});
after(async () => {
  cerrar();
  await db.cerrar();
});

/** Un navegador de mentiras: guarda la cookie de sesión entre llamadas. */
function visitante() {
  let cookie = "";
  return async (metodo: string, ruta: string, cuerpo?: unknown) => {
    const respuesta = await fetch(base + ruta, {
      method: metodo,
      headers: { ...(cuerpo ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    const puesta = respuesta.headers.get("set-cookie");
    if (puesta) cookie = puesta.split(";")[0]!;
    return { status: respuesta.status, datos: (await respuesta.json()) as any };
  };
}

test("un proveedor se registra, la casa lo activa y atiende un servicio hasta liquidarlo", async () => {
  const publico = visitante();
  const admin = visitante();
  const proveedor = visitante();

  // Sin sesión no se entra a nada.
  assert.equal((await publico("GET", "/api/admin/proveedores")).status, 401);
  assert.equal((await publico("GET", "/api/proveedor/servicios")).status, 401);
  assert.equal((await publico("GET", "/api/yo")).status, 401);

  // Registro público: queda pendiente y se le avisa a la casa.
  const registro = await publico("POST", "/api/registro", { nombre: "Carlos Ruiz", telefono: "55 1234 5678", ciudades: ["cdmx", "edomex"], equipo: "Hidrolavadora" });
  assert.equal(registro.status, 201);
  assert.equal((await publico("POST", "/api/registro", { nombre: "Carlos Otra Vez", telefono: "5512345678", ciudades: ["cdmx"] })).status, 409);
  // El campo trampa responde bien pero no crea nada.
  assert.equal((await publico("POST", "/api/registro", { nombre: "Robot", telefono: "5500000000", ciudades: ["cdmx"], sitio: "http://spam" })).status, 201);

  // Administración: clave incorrecta, luego la buena.
  assert.equal((await admin("POST", "/api/admin/entrar", { clave: "no es" })).status, 401);
  assert.equal((await admin("POST", "/api/admin/entrar", { clave: "clave-solo-de-prueba" })).status, 200);
  const lista = (await admin("GET", "/api/admin/proveedores")).datos;
  assert.equal(lista.length, 1);
  assert.equal(lista[0].estado, "pendiente");
  assert.deepEqual(lista[0].ciudades, ["cdmx", "edomex"]);
  const id = lista[0].id;
  assert.ok((await admin("GET", "/api/admin/avisos")).datos.some((a: any) => a.motivo === "proveedor_nuevo"));

  const activo = await admin("PATCH", `/api/admin/proveedores/${id}`, { estado: "activo", comision_pct: 20 });
  assert.equal(activo.datos.estado, "activo");
  assert.equal(activo.datos.comision_pct, 20);

  // Enlace de acceso: sirve una sola vez.
  const acceso = (await admin("POST", `/api/admin/proveedores/${id}/acceso`)).datos;
  assert.match(acceso.enlace, /^https:\/\/plataforma\.test\/entrar\//);
  assert.match(acceso.whatsapp, /^https:\/\/wa\.me\/525512345678\?text=/);
  const secreto = acceso.enlace.split("/entrar/")[1];
  assert.equal((await proveedor("POST", "/api/entrar", { acceso: secreto })).status, 200);
  assert.equal((await visitante()("POST", "/api/entrar", { acceso: secreto })).status, 401);

  const yo = (await proveedor("GET", "/api/yo")).datos;
  assert.equal(yo.proveedor.nombre, "Carlos Ruiz");
  assert.equal(yo.protocolosVigentes, false);
  // Un proveedor no entra a administración.
  assert.equal((await proveedor("GET", "/api/admin/proveedores")).status, 401);

  // Marca disponibilidad y la casa ve el horario para ofrecer.
  assert.equal((await proveedor("PUT", "/api/proveedor/disponibilidad", { fecha: MANANA, bloque: "b08", disponible: true })).status, 200);
  assert.equal((await proveedor("PUT", "/api/proveedor/disponibilidad", { fecha: MANANA, bloque: "b99", disponible: true })).status, 400);
  const horarios = (await admin("GET", "/api/admin/horarios?ciudad=cdmx")).datos;
  assert.deepEqual(horarios.opciones.map((o: any) => [o.fecha, o.bloque, o.cupo]), [[MANANA, "b08", 1]]);
  assert.equal(horarios.opciones[0].texto, "mañana a las 8:00 a.m.");

  // La casa agenda; un segundo servicio en ese horario ya no cabe.
  const cita = { cliente_nombre: "Marta Solís", cliente_telefono: "5598765432", ciudad: "cdmx", colonia: "Del Valle", direccion: "Calle 1 #2", tipo: "ambos", fecha: MANANA, bloque: "b08" };
  const agendado = await admin("POST", "/api/admin/servicios", cita);
  assert.equal(agendado.status, 201);
  assert.equal(agendado.datos.precio, 2200);
  assert.equal((await admin("POST", "/api/admin/servicios", cita)).datos.codigo, "sin_cupo");
  const servicioId = agendado.datos.id;

  // El proveedor lo ve sin datos de contacto y no lo puede tomar sin aceptar los protocolos.
  const abiertos = (await proveedor("GET", "/api/proveedor/servicios")).datos.abiertos;
  assert.equal(abiertos.length, 1);
  assert.equal(abiertos[0].cliente_telefono, "");
  assert.equal((await proveedor("POST", `/api/proveedor/servicios/${servicioId}/tomar`)).datos.codigo, "faltan_protocolos");
  assert.equal((await proveedor("POST", "/api/proveedor/protocolos")).status, 200);

  const tomado = await proveedor("POST", `/api/proveedor/servicios/${servicioId}/tomar`);
  assert.equal(tomado.datos.estado, "tomado");
  assert.equal(tomado.datos.comision_monto, 440);
  assert.equal(tomado.datos.cliente_telefono, "5598765432");

  assert.equal((await proveedor("POST", `/api/proveedor/servicios/${servicioId}/en-camino`)).datos.estado, "en_camino");
  const avisos = (await admin("GET", "/api/admin/avisos")).datos;
  const alCliente = avisos.find((a: any) => a.para === "cliente");
  assert.match(alCliente.whatsapp, /^https:\/\/wa\.me\/525598765432\?text=/);
  assert.equal((await admin("POST", `/api/admin/avisos/${alCliente.id}`, { estado: "enviado" })).status, 200);
  assert.equal((await admin("POST", `/api/admin/avisos/${alCliente.id}`, { estado: "enviado" })).status, 404);

  assert.equal((await proveedor("POST", `/api/proveedor/servicios/${servicioId}/realizado`)).datos.liquidacion_estado, "pendiente");
  assert.equal((await proveedor("POST", `/api/proveedor/servicios/${servicioId}/liquidar`, { nota: "Transferí $440" })).datos.liquidacion_estado, "reportada");
  assert.deepEqual((await admin("GET", "/api/admin/cuentas")).datos.map((s: any) => [s.nombre, s.por_cobrar, s.reportado]), [["Carlos Ruiz", 440, 440]]);
  assert.equal((await admin("POST", `/api/admin/servicios/${servicioId}/liquidacion`)).datos.liquidacion_estado, "pagada");

  const detalle = (await admin("GET", `/api/admin/servicios/${servicioId}`)).datos;
  assert.equal(detalle.eventos.length, 6);

  // Al suspenderlo pierde la sesión.
  await admin("PATCH", `/api/admin/proveedores/${id}`, { estado: "suspendido" });
  assert.equal((await proveedor("GET", "/api/proveedor/servicios")).status, 401);

  // Al salir, administración también queda fuera.
  await admin("POST", "/api/salir");
  assert.equal((await admin("GET", "/api/admin/proveedores")).status, 401);
});

test("datos mal formados se rechazan sin tumbar el servidor", async () => {
  const admin = visitante();
  await admin("POST", "/api/admin/entrar", { clave: "clave-solo-de-prueba" });
  assert.equal((await admin("POST", "/api/admin/servicios", { cliente_nombre: "X" })).status, 400);
  assert.equal((await admin("GET", "/api/admin/horarios?ciudad=atlantida")).status, 400);
  assert.equal((await admin("GET", "/api/admin/servicios/abc")).status, 404);
  assert.equal((await admin("GET", "/api/no-existe")).status, 404);
  assert.equal((await admin("GET", "/api/salud")).status, 200);
});
