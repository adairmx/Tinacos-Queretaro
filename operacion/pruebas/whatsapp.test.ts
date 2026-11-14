import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import type { AddressInfo } from "node:net";
import { after, afterEach, before, beforeEach, test } from "node:test";
import { ahoraEn, sumarDias } from "../shared/fechas.ts";
import type { Db } from "../server/db.ts";

// La configuración se lee al importar: estas variables van antes de cargar cualquier módulo del servidor.
process.env.WHATSAPP_APP_SECRET = "secreto-solo-de-prueba";
process.env.WHATSAPP_VERIFY_TOKEN = "verificacion-de-prueba";
process.env.ADMIN_WHATSAPP = "442 999 0000";
process.env.URL_PUBLICA = "https://plataforma.test";

const MANANA = sumarDias(ahoraEn("America/Mexico_City").fecha, 1);

type Modulos = {
  db: typeof import("../server/db.ts");
  app: typeof import("../server/app.ts");
  plantillas: typeof import("../server/lib/plantillas.ts");
  whatsapp: typeof import("../server/lib/whatsapp.ts");
  avisos: typeof import("../server/repos/avisos.ts");
  despacho: typeof import("../server/repos/despacho.ts");
  disponibilidad: typeof import("../server/repos/disponibilidad.ts");
  proveedores: typeof import("../server/repos/proveedores.ts");
  servicios: typeof import("../server/repos/servicios.ts");
};
let m: Modulos;
let db: Db;

before(async () => {
  m = {
    db: await import("../server/db.ts"),
    app: await import("../server/app.ts"),
    plantillas: await import("../server/lib/plantillas.ts"),
    whatsapp: await import("../server/lib/whatsapp.ts"),
    avisos: await import("../server/repos/avisos.ts"),
    despacho: await import("../server/repos/despacho.ts"),
    disponibilidad: await import("../server/repos/disponibilidad.ts"),
    proveedores: await import("../server/repos/proveedores.ts"),
    servicios: await import("../server/repos/servicios.ts"),
  };
});
beforeEach(async () => {
  db = await m.db.abrirDb();
});
afterEach(() => db.cerrar());

/** Un proveedor activo con espacio mañana a las 10 y un servicio agendado ahí: deja un aviso «servicio_nuevo» pendiente. */
async function servicioAgendado() {
  const proveedor = await m.proveedores.crearProveedor(db, { nombre: "Ana Torres", telefono: "4420000001", ciudades: ["queretaro"] }, "activo");
  await m.disponibilidad.fijarDisponibilidad(db, proveedor.id, MANANA, "b10", true);
  const servicio = await m.servicios.agendarServicio(db, {
    cliente_nombre: "Laura Méndez", cliente_telefono: "4421234567", ciudad: "queretaro", colonia: "Juriquilla", tipo: "tinaco", fecha: MANANA, bloque: "b10",
  });
  return { proveedor, servicio };
}

/** Un WhatsApp de mentiras que anota lo que se le pide mandar y falla cuando se le indica. */
function whatsappFalso(falla?: () => Error | undefined) {
  const enviados: { telefono: string; plantilla: string; variables: string[] }[] = [];
  return {
    enviados,
    async enviarPlantilla(telefono: string, plantilla: string, variables: string[]) {
      const error = falla?.();
      if (error) throw error;
      enviados.push({ telefono, plantilla, variables });
      return `wamid.${enviados.length}`;
    },
  };
}

test("las plantillas cumplen las reglas de Meta y traen un ejemplo por variable", () => {
  const { PLANTILLAS, variablesDe, redactar } = m.plantillas;
  for (const [clave, plantilla] of Object.entries(PLANTILLAS)) {
    const numeros = [...plantilla.cuerpo.matchAll(/\{\{(\d+)\}\}/g)].map((hallazgo) => Number(hallazgo[1]));
    assert.deepEqual(numeros, numeros.map((_, i) => i + 1), `${clave}: variables numeradas en orden`);
    assert.equal(plantilla.ejemplo.length, variablesDe(clave as keyof typeof PLANTILLAS), `${clave}: un ejemplo por variable`);
    assert.doesNotMatch(plantilla.cuerpo, /^\{\{|\}\}$/, `${clave}: no empieza ni termina con variable`);
    assert.match(plantilla.nombre, /^[a-z0-9_]+$/, `${clave}: nombre en minúsculas y guiones bajos`);
  }
  assert.equal(
    redactar("confirmacion_manana", ["Laura", "lavado de tinaco", "hoy a las 8:00 a.m."]),
    "Buenos días Laura, le escribimos de MonsterCo Lavado de Tinacos. Su lavado de tinaco es hoy a las 8:00 a.m. Le avisamos en cuanto el técnico vaya en camino.",
  );
});

test("el envío arma la petición que Meta espera y traduce sus errores", async () => {
  const pedidos: { url: string; init: RequestInit }[] = [];
  let respuesta: () => Response = () => Response.json({ messages: [{ id: "wamid.ABC" }] });
  const whatsapp = m.whatsapp.crearWhatsApp({
    token: "token-de-prueba",
    phoneNumberId: "1234567890",
    fetchImpl: (async (url: string, init: RequestInit) => {
      pedidos.push({ url, init });
      return respuesta();
    }) as typeof fetch,
  });

  assert.equal(await whatsapp.enviarPlantilla("4421234567", "en_camino", ["Laura"]), "wamid.ABC");
  assert.equal(pedidos[0]?.url, "https://graph.facebook.com/v20.0/1234567890/messages");
  assert.equal((pedidos[0]?.init.headers as Record<string, string>).Authorization, "Bearer token-de-prueba");
  assert.deepEqual(JSON.parse(String(pedidos[0]?.init.body)), {
    messaging_product: "whatsapp",
    to: "524421234567",
    type: "template",
    template: { name: "tecnico_en_camino", language: { code: "es_MX" }, components: [{ type: "body", parameters: [{ type: "text", text: "Laura" }] }] },
  });

  const falla = async () => whatsapp.enviarPlantilla("4421234567", "en_camino", ["Laura"]).then(() => undefined, (error) => error);

  respuesta = () => Response.json({ error: { code: 131026, message: "Message undeliverable" } }, { status: 400 });
  let error = await falla();
  assert.equal(error.reintentable, false);
  assert.match(error.message, /no tiene WhatsApp/);

  respuesta = () => Response.json({ error: { code: 131056, message: "Rate limit" } }, { status: 400 });
  assert.equal((await falla()).reintentable, true);

  respuesta = () => new Response("caído", { status: 503 });
  assert.equal((await falla()).reintentable, true);

  respuesta = () => {
    throw new TypeError("fetch failed");
  };
  error = await falla();
  assert.equal(error.reintentable, true);
  assert.match(error.message, /No se pudo conectar/);
});

test("los avisos pendientes salen solos por WhatsApp, cada uno una vez", async () => {
  const { servicio } = await servicioAgendado();
  await m.avisos.avisarALaCasa(db, "sin_proveedor", "Nadie ha tomado el servicio #1.", { servicioId: servicio.id });
  const whatsapp = whatsappFalso();

  assert.equal(await m.despacho.despacharAvisos(db, whatsapp), 2);
  assert.equal(await m.despacho.despacharAvisos(db, whatsapp), 0);
  assert.deepEqual(whatsapp.enviados.map((e) => [e.telefono, e.plantilla]), [["4420000001", "servicio_nuevo"], ["4429990000", "aviso_interno"]]);
  assert.match(whatsapp.enviados[0]!.variables[0]!, /^Lavado de tinaco en Querétaro, Juriquilla\./);
  assert.equal(whatsapp.enviados[0]!.variables[2], "https://plataforma.test/proveedor");

  assert.deepEqual(await m.avisos.avisosPendientes(db), []);
  const guardados = await db.query<{ estado: string; wamid: string }>("SELECT estado, wamid FROM avisos ORDER BY id");
  assert.deepEqual(guardados, [{ estado: "enviado", wamid: "wamid.1" }, { estado: "enviado", wamid: "wamid.2" }]);
});

test("un aviso que WhatsApp rechaza queda como fallido en el panel, con el motivo", async () => {
  await servicioAgendado();
  const rechazo = new m.whatsapp.ErrorDeWhatsApp("No se pudo entregar: el número no tiene WhatsApp.", false, 131026);

  assert.equal(await m.despacho.despacharAvisos(db, whatsappFalso(() => rechazo)), 0);
  const [fallido] = await m.avisos.avisosPendientes(db);
  assert.equal(fallido?.estado, "fallido");
  assert.match(fallido!.error!, /no tiene WhatsApp/);

  // Ya no se vuelve a intentar solo; la casa lo manda a mano y lo marca.
  const whatsapp = whatsappFalso();
  assert.equal(await m.despacho.despacharAvisos(db, whatsapp), 0);
  assert.equal(await m.avisos.resolverAviso(db, fallido!.id, "enviado"), true);
  assert.deepEqual(await m.avisos.avisosPendientes(db), []);
});

test("una falla pasajera se reintenta dejando tiempo entre intentos y se rinde al quinto", async () => {
  await servicioAgendado();
  const pasajera = new m.whatsapp.ErrorDeWhatsApp("No se pudo conectar con WhatsApp.", true);
  const caido = whatsappFalso(() => pasajera);
  const otraVez = () => db.query("UPDATE avisos SET ultimo_intento_en = now() - interval '1 hour'");

  await m.despacho.despacharAvisos(db, caido);
  let [aviso] = await db.query<{ estado: string; intentos: number }>("SELECT estado, intentos FROM avisos");
  assert.deepEqual(aviso, { estado: "pendiente", intentos: 1 });

  // Enseguida no se reintenta: todavía no pasa el tiempo de espera.
  await m.despacho.despacharAvisos(db, caido);
  [aviso] = await db.query("SELECT estado, intentos FROM avisos");
  assert.equal(aviso?.intentos, 1);

  for (let intento = 2; intento <= m.despacho.INTENTOS_MAXIMOS; intento++) {
    await otraVez();
    await m.despacho.despacharAvisos(db, caido);
  }
  [aviso] = await db.query("SELECT estado, intentos FROM avisos");
  assert.deepEqual(aviso, { estado: "fallido", intentos: m.despacho.INTENTOS_MAXIMOS });

  // Si WhatsApp vuelve antes de rendirse, el aviso sale.
  await db.query("UPDATE avisos SET estado = 'pendiente', intentos = 2, ultimo_intento_en = now() - interval '1 hour'");
  assert.equal(await m.despacho.despacharAvisos(db, whatsappFalso()), 1);
});

test("el webhook sólo acepta lo que firma Meta, anota entregas y guarda lo que contesta la gente", async () => {
  const { servicio, proveedor } = await servicioAgendado();
  await m.despacho.despacharAvisos(db, whatsappFalso());

  const servidor = m.app.crearApp(db).listen(0);
  after(() => servidor.close());
  const base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}/api/whatsapp/webhook`;
  const mandar = (cuerpo: unknown, secreto = "secreto-solo-de-prueba") => {
    const texto = JSON.stringify(cuerpo);
    return fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Hub-Signature-256": `sha256=${createHmac("sha256", secreto).update(texto).digest("hex")}` },
      body: texto,
    });
  };
  const aviso = (valor: object) => ({ object: "whatsapp_business_account", entry: [{ changes: [{ field: "messages", value: valor }] }] });

  // Verificación inicial de Meta.
  const verificado = await fetch(`${base}?hub.mode=subscribe&hub.verify_token=verificacion-de-prueba&hub.challenge=12345`);
  assert.equal(verificado.status, 200);
  assert.equal(await verificado.text(), "12345");
  assert.equal((await fetch(`${base}?hub.mode=subscribe&hub.verify_token=otro&hub.challenge=12345`)).status, 403);

  // Sin firma válida no entra nada.
  assert.equal((await mandar(aviso({ statuses: [{ id: "wamid.1", status: "read" }] }), "otro-secreto")).status, 401);
  assert.equal((await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })).status, 401);
  assert.deepEqual(await db.query("SELECT leido_en FROM avisos"), [{ leido_en: null }]);

  // Entregado y leído.
  assert.equal((await mandar(aviso({ statuses: [{ id: "wamid.1", status: "delivered" }, { id: "wamid.1", status: "read" }] }))).status, 200);
  const [acuse] = await db.query<{ entregado: boolean; leido: boolean }>("SELECT entregado_en IS NOT NULL AS entregado, leido_en IS NOT NULL AS leido FROM avisos");
  assert.deepEqual(acuse, { entregado: true, leido: true });

  // El cliente contesta: se guarda una sola vez y la casa se entera.
  const respuesta = aviso({
    contacts: [{ wa_id: "5214421234567", profile: { name: "Lau" } }],
    messages: [{ id: "wamid.entrante.1", from: "5214421234567", type: "text", text: { body: "Sí, aquí estaremos" } }],
  });
  assert.equal((await mandar(respuesta)).status, 200);
  assert.equal((await mandar(respuesta)).status, 200);
  const entrantes = await db.query<{ telefono: string; texto: string; servicio_id: number }>("SELECT telefono, texto, servicio_id FROM mensajes_entrantes");
  assert.deepEqual(entrantes, [{ telefono: "4421234567", texto: "Sí, aquí estaremos", servicio_id: servicio.id }]);
  const aLaCasa = (await m.avisos.avisosPendientes(db)).filter((a) => a.motivo === "mensaje_entrante");
  assert.equal(aLaCasa.length, 1);
  assert.equal(aLaCasa[0]?.texto, `Laura Méndez (servicio #${servicio.id}) escribió por WhatsApp: «Sí, aquí estaremos»`);

  // Un proveedor que escribe se reconoce por su teléfono.
  await mandar(aviso({ messages: [{ id: "wamid.entrante.2", from: "524420000001", type: "audio", audio: { id: "x" } }] }));
  const [delProveedor] = await db.query<{ proveedor_id: number; texto: string }>("SELECT proveedor_id, texto FROM mensajes_entrantes WHERE wamid = 'wamid.entrante.2'");
  assert.deepEqual(delProveedor, { proveedor_id: proveedor.id, texto: "[Nota de voz]" });

  // Si WhatsApp avisa después que no pudo entregar, el aviso vuelve al panel como fallido.
  await mandar(aviso({ statuses: [{ id: "wamid.1", status: "failed", errors: [{ code: 131026, title: "Message undeliverable" }] }] }));
  const [fallido] = (await m.avisos.avisosPendientes(db)).filter((a) => a.motivo === "servicio_nuevo");
  assert.equal(fallido?.estado, "fallido");
  assert.match(fallido!.error!, /no tiene WhatsApp/);
});
