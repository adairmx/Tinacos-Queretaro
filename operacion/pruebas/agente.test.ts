import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import type { AddressInfo } from "node:net";
import { afterEach, before, beforeEach, test } from "node:test";
import { ahoraEn, sumarDias } from "../shared/fechas.ts";
import type { Modelo } from "../server/agente/agente.ts";
import type { Herramienta } from "../server/agente/herramientas.ts";
import type { Db } from "../server/db.ts";

// La configuración se lee al importar: estas variables van antes de cargar cualquier módulo del servidor.
process.env.ADMIN_PASSWORD = "clave-solo-de-prueba";
process.env.WHATSAPP_APP_SECRET = "secreto-solo-de-prueba";

const MANANA = sumarDias(ahoraEn("America/Mexico_City").fecha, 1);
const CLIENTE = "4421234567";

type Modulos = {
  db: typeof import("../server/db.ts");
  app: typeof import("../server/app.ts");
  agente: typeof import("../server/agente/agente.ts");
  atender: typeof import("../server/agente/atender.ts");
  avisos: typeof import("../server/repos/avisos.ts");
  despacho: typeof import("../server/repos/despacho.ts");
  disponibilidad: typeof import("../server/repos/disponibilidad.ts");
  prospectos: typeof import("../server/repos/prospectos.ts");
  proveedores: typeof import("../server/repos/proveedores.ts");
  servicios: typeof import("../server/repos/servicios.ts");
};
let m: Modulos;
let db: Db;

before(async () => {
  m = {
    db: await import("../server/db.ts"),
    app: await import("../server/app.ts"),
    agente: await import("../server/agente/agente.ts"),
    atender: await import("../server/agente/atender.ts"),
    avisos: await import("../server/repos/avisos.ts"),
    despacho: await import("../server/repos/despacho.ts"),
    disponibilidad: await import("../server/repos/disponibilidad.ts"),
    prospectos: await import("../server/repos/prospectos.ts"),
    proveedores: await import("../server/repos/proveedores.ts"),
    servicios: await import("../server/repos/servicios.ts"),
  };
});
beforeEach(async () => {
  db = await m.db.abrirDb();
  const proveedor = await m.proveedores.crearProveedor(db, { nombre: "Ana Torres", telefono: "4420000001", ciudades: ["queretaro"] }, "activo");
  await m.disponibilidad.fijarDisponibilidad(db, proveedor.id, MANANA, "b08", true);
});
afterEach(() => db.cerrar());

type Caja = Record<string, Herramienta>;
/** Un modelo de mentiras: en vez de pensar, sigue un libreto que puede usar las herramientas de verdad. */
const conLibreto = (libreto: (caja: Caja, mensajes: { role: string; content: string }[]) => Promise<string>): Modelo => ({
  correr: async ({ herramientas, mensajes }) => ({ texto: await libreto(Object.fromEntries(herramientas.map((h) => [h.nombre, h])), mensajes), rechazo: false }),
});

const cita = { nombre: "Laura Méndez", ciudad: "queretaro", colonia: "Juriquilla", direccion: "Av. Siempre Viva 12", tipo: "tinaco", litros: 1100, fecha: MANANA, bloque: "b08" };
const sinPase = async () => undefined;

function whatsappFalso() {
  const textos: { telefono: string; texto: string }[] = [];
  return {
    textos,
    enviarPlantilla: async () => "wamid.plantilla",
    async enviarTexto(telefono: string, texto: string) {
      textos.push({ telefono, texto });
      return `wamid.${textos.length}`;
    },
  };
}

test("el agente ofrece los horarios reales y en el simulador no agenda de verdad", async () => {
  const modelo = conLibreto(async (caja) => {
    const horarios = JSON.parse(await caja.consultar_horarios!.correr({ ciudad: "queretaro" }));
    assert.equal(horarios.disponibles, true);
    assert.deepEqual(horarios.ofrecer, [{ fecha: MANANA, bloque: "b08", decir: "mañana a las 8:00 a.m." }]);
    const agendado = JSON.parse(await caja.agendar_servicio!.correr(cita));
    assert.deepEqual([agendado.agendado, agendado.simulacro, agendado.precio], [true, true, 1050]);
    return "Listo, quedó agendado para mañana a las 8.";
  });

  const respuesta = await m.agente.responder(modelo, [{ rol: "cliente", texto: "Quiero lavar mi tinaco" }], { db, telefono: CLIENTE, simulado: true, alPasarAHumano: sinPase });
  assert.equal(respuesta.texto, "Listo, quedó agendado para mañana a las 8.");
  assert.deepEqual(respuesta.herramientas.map((h) => h.nombre), ["consultar_horarios", "agendar_servicio"]);
  assert.equal(respuesta.pasoAHumano, false);
  assert.deepEqual(await m.servicios.listarServicios(db), []);
});

test("sin horarios en la ciudad, la herramienta le dice al agente que pase la plática", async () => {
  const modelo = conLibreto(async (caja) => {
    const horarios = JSON.parse(await caja.consultar_horarios!.correr({ ciudad: "cancun" }));
    assert.equal(horarios.disponibles, false);
    await caja.pasar_a_humano!.correr({ motivo: "Sin horarios en Cancún", resumen: "Quiere lavar una cisterna en Cancún." });
    return "En un momento le atiende una persona del equipo.";
  });
  const pases: string[] = [];
  const respuesta = await m.agente.responder(modelo, [{ rol: "cliente", texto: "¿Atienden en Cancún?" }], {
    db, telefono: CLIENTE, simulado: true, alPasarAHumano: async (motivo) => void pases.push(motivo),
  });
  assert.equal(respuesta.pasoAHumano, true);
  assert.deepEqual(pases, ["Sin horarios en Cancún"]);
});

test("si el modelo se niega o no dice nada, la persona pasa con alguien del equipo", async () => {
  const pases: string[] = [];
  const contexto = { db, telefono: CLIENTE, simulado: true, alPasarAHumano: async (motivo: string) => void pases.push(motivo) };
  const mudo: Modelo = { correr: async () => ({ texto: "", rechazo: false }) };
  const negado: Modelo = { correr: async () => ({ texto: "", rechazo: true }) };

  const uno = await m.agente.responder(mudo, [{ rol: "cliente", texto: "Hola" }], contexto);
  const dos = await m.agente.responder(negado, [{ rol: "cliente", texto: "Hola" }], contexto);
  assert.equal(uno.pasoAHumano && dos.pasoAHumano, true);
  assert.match(uno.texto, /le atiende una persona de nuestro equipo/);
  assert.deepEqual(pases, ["El agente se quedó sin respuesta", "El agente no pudo contestar"]);
});

test("por WhatsApp el agente contesta, agenda de verdad y deja el lead ligado a la cita", async () => {
  const whatsapp = whatsappFalso();
  const modelo = conLibreto(async (caja, mensajes) => {
    // El agente recibe la plática completa, con lo que la persona escribió en varios mensajes.
    assert.deepEqual(mensajes.map((x) => x.content), ["Hola", "Quiero lavar mi tinaco mañana"]);
    const agendado = JSON.parse(await caja.agendar_servicio!.correr(cita));
    return `Quedó agendado con el folio ${agendado.folio}.`;
  });
  const llega = async (wamid: string, texto: string) => {
    const mensaje = { wamid, telefono: CLIENTE, nombre: "Laura", texto };
    assert.equal(await m.atender.leTocaAlAgente(db, CLIENTE), true);
    await m.despacho.recibirMensaje(db, mensaje, { loAtiendeElAgente: true });
    await m.atender.anotarMensajeDelCliente(db, mensaje);
  };
  await llega("wamid.a", "Hola");
  await llega("wamid.b", "Quiero lavar mi tinaco mañana");

  const respuesta = await m.atender.atenderConversacion({ db, modelo, whatsapp }, CLIENTE);
  assert.match(respuesta!.texto, /^Quedó agendado con el folio \d+\.$/);
  assert.deepEqual(whatsapp.textos, [{ telefono: CLIENTE, texto: respuesta!.texto }]);

  const [servicio] = await m.servicios.listarServicios(db);
  assert.deepEqual([servicio?.cliente_telefono, servicio?.origen, servicio?.precio, servicio?.estado], [CLIENTE, "agente_whatsapp", 1050, "agendado"]);
  const [lead] = await m.prospectos.listarProspectos(db);
  assert.deepEqual([lead?.origen, lead?.estado, lead?.servicio_id], ["whatsapp", "agendado", servicio?.id]);

  // A la casa sólo le llegó el aviso del lead nuevo, no uno por cada mensaje.
  assert.deepEqual((await m.avisos.avisosPendientes(db)).filter((a) => a.para === "admin").map((a) => a.motivo), ["lead_nuevo"]);

  // Ya contestado, no vuelve a contestar; y con una cita en curso, lo que escriba le toca a la casa.
  assert.equal(await m.atender.atenderConversacion({ db, modelo, whatsapp }, CLIENTE), undefined);
  assert.equal(await m.atender.leTocaAlAgente(db, CLIENTE), false);
});

test("cuando el agente pasa la plática o falla, la casa se entera y el agente deja de contestar", async () => {
  const whatsapp = whatsappFalso();
  const escribe = (telefono: string, wamid: string, texto: string) => m.atender.anotarMensajeDelCliente(db, { wamid, telefono, nombre: "Pedro", texto });

  const quePasa = conLibreto(async (caja) => {
    await caja.pasar_a_humano!.correr({ motivo: "Pide factura", resumen: "Quiere lavar dos cisternas y necesita factura." });
    return "En un momento le atiende una persona del equipo.";
  });
  await escribe("5511112222", "wamid.1", "¿Me dan factura?");
  await m.atender.atenderConversacion({ db, modelo: quePasa, whatsapp }, "5511112222");
  assert.equal(whatsapp.textos.at(-1)?.texto, "En un momento le atiende una persona del equipo.");
  assert.equal(await m.atender.leTocaAlAgente(db, "5511112222"), false);

  const queFalla: Modelo = { correr: async () => Promise.reject(new Error("se cayó")) };
  await escribe("5533334444", "wamid.2", "Hola");
  assert.equal(await m.atender.atenderConversacion({ db, modelo: queFalla, whatsapp }, "5533334444"), undefined);
  assert.equal(await m.atender.leTocaAlAgente(db, "5533334444"), false);

  const avisos = (await m.avisos.avisosPendientes(db)).filter((a) => a.motivo === "agente_pasa_platica").map((a) => a.texto);
  assert.deepEqual(avisos, [
    "El agente te pasó la plática de Pedro (551 111 2222): Pide factura. Quiere lavar dos cisternas y necesita factura.",
    "El agente te pasó la plática de Pedro (553 333 4444): El agente falló al contestar. Hay que contestarle a mano.",
  ]);
});

test("al agente no le tocan los proveedores", async () => {
  assert.equal(await m.atender.leTocaAlAgente(db, "4420000001"), false);
  assert.equal(await m.atender.leTocaAlAgente(db, "4429998877"), true);
});

test("el simulador pide la llave de Claude, y con el agente activo el webhook contesta solo", async () => {
  const pedir = async (base: string, metodo: string, ruta: string, cuerpo?: unknown, encabezados: Record<string, string> = {}) => {
    const texto = cuerpo ? JSON.stringify(cuerpo) : undefined;
    const respuesta = await fetch(base + ruta, { method: metodo, headers: { ...(texto ? { "Content-Type": "application/json" } : {}), ...encabezados }, body: texto });
    return { status: respuesta.status, datos: (await respuesta.json().catch(() => ({}))) as any, cookie: respuesta.headers.get("set-cookie")?.split(";")[0] ?? "" };
  };
  const levantar = (dependencias: Parameters<Modulos["app"]["crearApp"]>[1]) => {
    const servidor = m.app.crearApp(db, dependencias).listen(0);
    return { base: `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`, cerrar: () => servidor.close() };
  };

  // Sin modelo: el panel dice qué falta.
  const sinLlave = levantar({});
  let sesion = { Cookie: (await pedir(sinLlave.base, "POST", "/api/admin/entrar", { clave: "clave-solo-de-prueba" })).cookie };
  assert.equal((await pedir(sinLlave.base, "GET", "/api/admin/agente", undefined, sesion)).datos.configurado, false);
  const sinAgente = await pedir(sinLlave.base, "POST", "/api/admin/agente/probar", { mensajes: [{ rol: "cliente", texto: "Hola" }] }, sesion);
  assert.deepEqual([sinAgente.status, sinAgente.datos.codigo], [503, "agente_sin_llave"]);
  sinLlave.cerrar();

  // Con modelo y agente activo.
  const whatsapp = whatsappFalso();
  const modelo = conLibreto(async (caja, mensajes) => {
    await caja.consultar_horarios!.correr({ ciudad: "queretaro" });
    return `Recibí: ${mensajes.at(-1)?.content}`;
  });
  const activo = levantar({ modelo, whatsapp, agenteActivo: true, esperaMs: 1 });
  sesion = { Cookie: (await pedir(activo.base, "POST", "/api/admin/entrar", { clave: "clave-solo-de-prueba" })).cookie };

  const estado = (await pedir(activo.base, "GET", "/api/admin/agente", undefined, sesion)).datos;
  assert.deepEqual([estado.configurado, estado.contestaSolo], [true, true]);
  assert.match(estado.guion, /MonsterCo Lavado de Tinacos y Cisternas/);
  assert.equal((await pedir(activo.base, "POST", "/api/admin/agente/probar", { mensajes: [{ rol: "cliente", texto: "Hola" }] })).status, 401);

  const prueba = await pedir(activo.base, "POST", "/api/admin/agente/probar", { mensajes: [{ rol: "cliente", texto: "¿Cuánto cuesta?" }] }, sesion);
  assert.deepEqual([prueba.status, prueba.datos.texto, prueba.datos.herramientas.map((h: any) => h.nombre)], [200, "Recibí: ¿Cuánto cuesta?", ["consultar_horarios"]]);
  assert.deepEqual(whatsapp.textos, []);

  // Un WhatsApp de alguien nuevo: el agente le contesta por su cuenta.
  const cuerpo = JSON.stringify({
    object: "whatsapp_business_account",
    entry: [{ changes: [{ field: "messages", value: { contacts: [{ wa_id: `521${CLIENTE}`, profile: { name: "Laura" } }], messages: [{ id: "wamid.x", from: `521${CLIENTE}`, type: "text", text: { body: "Hola, quiero informes" } }] } }] }],
  });
  const firma = `sha256=${createHmac("sha256", "secreto-solo-de-prueba").update(cuerpo).digest("hex")}`;
  const entrada = await fetch(`${activo.base}/api/whatsapp/webhook`, { method: "POST", headers: { "Content-Type": "application/json", "X-Hub-Signature-256": firma }, body: cuerpo });
  assert.equal(entrada.status, 200);

  for (let intento = 0; intento < 50 && whatsapp.textos.length === 0; intento++) await new Promise((listo) => setTimeout(listo, 20));
  assert.deepEqual(whatsapp.textos, [{ telefono: CLIENTE, texto: "Recibí: Hola, quiero informes" }]);
  activo.cerrar();
});
