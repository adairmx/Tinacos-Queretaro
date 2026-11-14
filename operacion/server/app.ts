import { existsSync } from "node:fs";
import path from "node:path";
import express, { type NextFunction, type Request, type Response } from "express";
import { z, ZodError } from "zod";
import { BLOQUES } from "../shared/bloques.ts";
import { ciudadPorSlug } from "../shared/ciudades.ts";
import { ahoraEn, sumarDias } from "../shared/fechas.ts";
import { TIPOS_DE_SERVICIO } from "../shared/precios.ts";
import { enlaceWhatsApp } from "../shared/telefono.ts";
import { PROTOCOLOS_VERSION } from "../shared/tipos.ts";
import { config } from "./config.ts";
import type { Db } from "./db.ts";
import { crearFreno } from "./lib/freno.ts";
import { Rechazo } from "./lib/rechazo.ts";
import { abrirSesion, canjearAcceso, cerrarSesion, crearAcceso, DIAS_DE_SESION, leerSesion, mismaClave, type Sesion } from "./lib/sesiones.ts";
import { firmaValida, leerWebhook } from "./lib/whatsapp.ts";
import { avisarALaCasa, avisosPendientes, resolverAviso } from "./repos/avisos.ts";
import { anotarAcuse, recibirMensaje } from "./repos/despacho.ts";
import { copiarSemana, DIAS_DE_AGENDA, disponibilidadDe, fijarDisponibilidad, horariosConCupo, opcionesParaCliente } from "./repos/disponibilidad.ts";
import { aceptarProtocolos, actualizarProveedor, crearProveedor, listarProveedores, obtenerProveedor } from "./repos/proveedores.ts";
import {
  agendarServicio, cancelarServicio, confirmarLiquidacion, eventosDe, listarServicios, marcarEnCamino, marcarRealizado, obtenerServicio,
  reportarLiquidacion, saldos, serviciosAbiertosPara, serviciosDe, soltarServicio, tomarServicio,
} from "./repos/servicios.ts";

const COOKIE = "sesion";

const texto = (maximo: number) => z.string().trim().max(maximo);
const opcional = (maximo: number) => texto(maximo).nullish();
const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const bloque = z.enum(BLOQUES.map((b) => b.id) as [string, ...string[]]);

const datosDeProveedor = z.object({
  nombre: texto(120).min(3),
  telefono: texto(30),
  ciudades: z.array(texto(40)).min(1).max(20),
  equipo: opcional(500),
  experiencia: opcional(500),
});

const cambiosDeProveedor = z.object({
  nombre: texto(120).min(3).optional(),
  estado: z.enum(["pendiente", "activo", "suspendido"]).optional(),
  comision_pct: z.number().int().min(0).max(100).optional(),
  liquidacion: z.enum(["por_servicio", "semanal"]).optional(),
  notas: opcional(1000),
  ciudades: z.array(texto(40)).min(1).max(20).optional(),
});

const datosDeServicio = z.object({
  cliente_nombre: texto(120).min(1),
  cliente_telefono: texto(30),
  ciudad: texto(40),
  colonia: opcional(120),
  direccion: opcional(300),
  tipo: z.enum(TIPOS_DE_SERVICIO),
  litros: z.number().int().positive().max(1_000_000).nullish(),
  precio: z.number().int().min(0).max(1_000_000).optional(),
  fecha,
  bloque,
  notas: opcional(1000),
  forzar: z.boolean().optional(),
});

const idDe = (req: Request) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new Rechazo("no_existe", "No existe.", 404);
  return id;
};

function cookieDe(req: Request) {
  const par = (req.headers.cookie ?? "").split(";").map((trozo) => trozo.trim()).find((trozo) => trozo.startsWith(`${COOKIE}=`));
  return par?.slice(COOKIE.length + 1);
}

function ponerCookie(res: Response, secreto: string | null) {
  const partes = [`${COOKIE}=${secreto ?? ""}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${secreto ? DIAS_DE_SESION * 86400 : 0}`];
  if (config.produccion) partes.push("Secure");
  res.setHeader("Set-Cookie", partes.join("; "));
}

declare module "express-serve-static-core" {
  interface Request {
    sesion?: Sesion;
    crudo?: Buffer;
  }
}

export function crearApp(db: Db) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  // Se guarda el cuerpo tal como llegó: la firma del webhook de WhatsApp se calcula sobre esos bytes exactos.
  app.use(express.json({ limit: "1mb", verify: (req, _res, crudo) => void ((req as Request).crudo = crudo) }));

  const frenoDeEntrada = crearFreno(10, 15 * 60_000);
  const frenoDeRegistro = crearFreno(5, 60 * 60_000);
  const visitante = (req: Request) => req.ip ?? "desconocido";

  app.use("/api", async (req, _res, next) => {
    req.sesion = await leerSesion(db, cookieDe(req));
    next();
  });

  const soloAdmin = (req: Request, _res: Response, next: NextFunction) => {
    if (req.sesion?.tipo !== "admin") throw new Rechazo("sin_sesion", "Inicia sesión como administración.", 401);
    next();
  };

  /** Deja pasar a un proveedor con sesión que no esté suspendido y regresa su id. */
  const proveedorDe = async (req: Request) => {
    const id = req.sesion?.tipo === "proveedor" ? req.sesion.proveedorId : null;
    const proveedor = id ? await obtenerProveedor(db, id) : undefined;
    if (!proveedor || proveedor.estado === "suspendido") throw new Rechazo("sin_sesion", "Entra con tu enlace de acceso.", 401);
    return proveedor;
  };

  app.get("/api/salud", async (_req, res) => {
    await db.query("SELECT 1");
    res.json({ ok: true });
  });

  // ── Sesión ──────────────────────────────────────────────────────────────────────────────────────

  app.get("/api/yo", async (req, res) => {
    if (req.sesion?.tipo === "admin") return void res.json({ tipo: "admin" });
    if (req.sesion?.tipo === "proveedor") {
      const proveedor = await proveedorDe(req);
      return void res.json({ tipo: "proveedor", proveedor, protocolosVigentes: proveedor.protocolos_version === PROTOCOLOS_VERSION });
    }
    throw new Rechazo("sin_sesion", "No has iniciado sesión.", 401);
  });

  app.post("/api/admin/entrar", async (req, res) => {
    if (!frenoDeEntrada(visitante(req))) throw new Rechazo("demasiados_intentos", "Demasiados intentos. Espera unos minutos.", 429);
    const { clave } = z.object({ clave: z.string().min(1).max(200) }).parse(req.body);
    if (!config.adminPassword || !mismaClave(clave, config.adminPassword)) throw new Rechazo("clave_incorrecta", "La clave no es correcta.", 401);
    ponerCookie(res, await abrirSesion(db, "admin"));
    res.json({ tipo: "admin" });
  });

  app.post("/api/entrar", async (req, res) => {
    if (!frenoDeEntrada(visitante(req))) throw new Rechazo("demasiados_intentos", "Demasiados intentos. Espera unos minutos.", 429);
    const { acceso } = z.object({ acceso: z.string().min(20).max(200) }).parse(req.body);
    const proveedorId = await canjearAcceso(db, acceso);
    const proveedor = proveedorId ? await obtenerProveedor(db, proveedorId) : undefined;
    if (!proveedor || proveedor.estado === "suspendido") {
      throw new Rechazo("acceso_invalido", "Este enlace ya se usó o venció. Pide uno nuevo.", 401);
    }
    ponerCookie(res, await abrirSesion(db, "proveedor", proveedor.id));
    res.json({ tipo: "proveedor" });
  });

  app.post("/api/salir", async (req, res) => {
    const secreto = cookieDe(req);
    if (secreto) await cerrarSesion(db, secreto);
    ponerCookie(res, null);
    res.json({ ok: true });
  });

  // ── Registro público de proveedores ─────────────────────────────────────────────────────────────

  app.post("/api/registro", async (req, res) => {
    // Campo trampa: una persona no lo ve; un robot lo llena.
    if (typeof req.body?.sitio === "string" && req.body.sitio !== "") return void res.status(201).json({ ok: true });
    if (!frenoDeRegistro(visitante(req))) throw new Rechazo("demasiados_intentos", "Demasiados registros. Intenta más tarde.", 429);

    const proveedor = await crearProveedor(db, datosDeProveedor.parse(req.body));
    await avisarALaCasa(
      db,
      "proveedor_nuevo",
      `${proveedor.nombre} se registró como proveedor (${proveedor.ciudades.map((c) => ciudadPorSlug(c)?.nombre ?? c).join(", ")}). Falta revisarlo y activarlo.`,
      { proveedorId: proveedor.id },
    );
    res.status(201).json({ ok: true });
  });

  // ── WhatsApp: Meta avisa aquí de entregas y de lo que la gente contesta ─────────────────────────

  app.get("/api/whatsapp/webhook", (req, res) => {
    const { verifyToken } = config.whatsapp;
    if (verifyToken && req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === verifyToken) {
      return void res.type("text/plain").send(String(req.query["hub.challenge"] ?? ""));
    }
    res.sendStatus(403);
  });

  app.post("/api/whatsapp/webhook", async (req, res) => {
    const { appSecret } = config.whatsapp;
    if (!appSecret || !req.crudo || !firmaValida(req.crudo, req.header("x-hub-signature-256"), appSecret)) return void res.sendStatus(401);

    const { mensajes, acuses } = leerWebhook(req.body);
    for (const acuse of acuses) await anotarAcuse(db, acuse);
    for (const mensaje of mensajes) await recibirMensaje(db, mensaje);
    res.json({ ok: true });
  });

  // ── Proveedor ───────────────────────────────────────────────────────────────────────────────────

  app.get("/api/proveedor/disponibilidad", async (req, res) => {
    const proveedor = await proveedorDe(req);
    const hoy = ahoraEn(ciudadPorSlug(proveedor.ciudades[0] ?? "")?.zona ?? "America/Mexico_City").fecha;
    res.json({ hoy, dias: DIAS_DE_AGENDA, espacios: await disponibilidadDe(db, proveedor.id, hoy, sumarDias(hoy, DIAS_DE_AGENDA)) });
  });

  app.put("/api/proveedor/disponibilidad", async (req, res) => {
    const proveedor = await proveedorDe(req);
    const espacio = z.object({ fecha, bloque, disponible: z.boolean() }).parse(req.body);
    await fijarDisponibilidad(db, proveedor.id, espacio.fecha, espacio.bloque, espacio.disponible);
    res.json({ ok: true });
  });

  app.post("/api/proveedor/disponibilidad/copiar", async (req, res) => {
    const proveedor = await proveedorDe(req);
    const { desde } = z.object({ desde: fecha }).parse(req.body);
    res.json({ copiados: await copiarSemana(db, proveedor.id, desde) });
  });

  app.get("/api/proveedor/servicios", async (req, res) => {
    const proveedor = await proveedorDe(req);
    res.json({ abiertos: await serviciosAbiertosPara(db, proveedor.id), mios: await serviciosDe(db, proveedor.id) });
  });

  app.post("/api/proveedor/protocolos", async (req, res) => {
    const proveedor = await proveedorDe(req);
    await aceptarProtocolos(db, proveedor.id);
    res.json({ ok: true });
  });

  app.post("/api/proveedor/servicios/:id/tomar", async (req, res) => {
    const proveedor = await proveedorDe(req);
    if (proveedor.protocolos_version !== PROTOCOLOS_VERSION) {
      throw new Rechazo("faltan_protocolos", "Antes de tomar servicios, lee y acepta los protocolos de servicio.", 403);
    }
    res.json(await tomarServicio(db, idDe(req), proveedor.id));
  });

  app.post("/api/proveedor/servicios/:id/en-camino", async (req, res) => {
    res.json(await marcarEnCamino(db, idDe(req), (await proveedorDe(req)).id));
  });

  app.post("/api/proveedor/servicios/:id/realizado", async (req, res) => {
    res.json(await marcarRealizado(db, idDe(req), (await proveedorDe(req)).id));
  });

  app.post("/api/proveedor/servicios/:id/liquidar", async (req, res) => {
    const { nota } = z.object({ nota: opcional(300) }).parse(req.body ?? {});
    res.json(await reportarLiquidacion(db, idDe(req), (await proveedorDe(req)).id, nota));
  });

  // ── Administración ──────────────────────────────────────────────────────────────────────────────

  app.use("/api/admin", soloAdmin);

  app.get("/api/admin/proveedores", async (_req, res) => {
    res.json(await listarProveedores(db));
  });

  app.post("/api/admin/proveedores", async (req, res) => {
    res.status(201).json(await crearProveedor(db, datosDeProveedor.parse(req.body), "activo"));
  });

  app.patch("/api/admin/proveedores/:id", async (req, res) => {
    res.json(await actualizarProveedor(db, idDe(req), cambiosDeProveedor.parse(req.body)));
  });

  /** Enlace de un solo uso para que el proveedor entre; la casa se lo manda por WhatsApp. */
  app.post("/api/admin/proveedores/:id/acceso", async (req, res) => {
    const proveedor = await obtenerProveedor(db, idDe(req));
    if (!proveedor) throw new Rechazo("no_existe", "Ese proveedor no existe.", 404);
    const enlace = `${config.urlPublica}/entrar/${await crearAcceso(db, proveedor.id)}`;
    const mensaje = `Hola ${proveedor.nombre.split(" ")[0]}, este es tu acceso a la plataforma de ${config.marca}. Ábrelo desde tu celular: ${enlace}`;
    res.json({ enlace, whatsapp: enlaceWhatsApp(proveedor.telefono, mensaje) });
  });

  app.get("/api/admin/horarios", async (req, res) => {
    const { ciudad } = z.object({ ciudad: texto(40) }).parse(req.query);
    const ahora = new Date();
    res.json({
      opciones: await opcionesParaCliente(db, ciudad, ahora, config.anticipacionMinutos),
      todos: await horariosConCupo(db, ciudad, ahora, config.anticipacionMinutos),
    });
  });

  app.get("/api/admin/servicios", async (req, res) => {
    const filtro = z.object({ estado: texto(20).optional(), desde: fecha.optional(), hasta: fecha.optional() }).parse(req.query);
    res.json(await listarServicios(db, filtro));
  });

  app.post("/api/admin/servicios", async (req, res) => {
    const { forzar, ...datos } = datosDeServicio.parse(req.body);
    res.status(201).json(await agendarServicio(db, datos, { forzar, actor: "admin" }));
  });

  app.get("/api/admin/servicios/:id", async (req, res) => {
    const servicio = await obtenerServicio(db, idDe(req));
    if (!servicio) throw new Rechazo("no_existe", "Ese servicio no existe.", 404);
    res.json({ servicio, eventos: await eventosDe(db, servicio.id) });
  });

  app.post("/api/admin/servicios/:id/cancelar", async (req, res) => {
    const { motivo } = z.object({ motivo: texto(300).min(3) }).parse(req.body);
    res.json(await cancelarServicio(db, idDe(req), motivo));
  });

  app.post("/api/admin/servicios/:id/soltar", async (req, res) => {
    res.json(await soltarServicio(db, idDe(req)));
  });

  app.post("/api/admin/servicios/:id/liquidacion", async (req, res) => {
    res.json(await confirmarLiquidacion(db, idDe(req)));
  });

  app.get("/api/admin/avisos", async (_req, res) => {
    const avisos = await avisosPendientes(db);
    res.json(avisos.map((aviso) => ({ ...aviso, whatsapp: aviso.telefono ? enlaceWhatsApp(aviso.telefono, aviso.texto) : null })));
  });

  app.post("/api/admin/avisos/:id", async (req, res) => {
    const { estado } = z.object({ estado: z.enum(["enviado", "descartado"]) }).parse(req.body);
    if (!(await resolverAviso(db, idDe(req), estado))) throw new Rechazo("no_existe", "Ese aviso ya no está pendiente.", 404);
    res.json({ ok: true });
  });

  app.get("/api/admin/estado", (_req, res) => {
    res.json({ whatsapp: Boolean(config.whatsapp.token && config.whatsapp.phoneNumberId) });
  });

  app.get("/api/admin/cuentas", async (_req, res) => {
    res.json(await saldos(db));
  });

  app.use("/api", () => {
    throw new Rechazo("no_existe", "Esa ruta no existe.", 404);
  });

  // ── Panel ya compilado (en desarrollo lo sirve Vite) ────────────────────────────────────────────

  const panel = path.resolve("dist");
  if (existsSync(path.join(panel, "index.html"))) {
    app.use(express.static(panel, { index: false, maxAge: "1h" }));
    app.get(/.*/, (_req, res) => res.sendFile(path.join(panel, "index.html")));
  }

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof Rechazo) return void res.status(error.status).json({ codigo: error.codigo, mensaje: error.message });
    if (error instanceof ZodError) return void res.status(400).json({ codigo: "datos_invalidos", mensaje: "Revisa los datos: falta algo o no tiene el formato esperado." });
    if ((error as { type?: string }).type === "entity.parse.failed") return void res.status(400).json({ codigo: "datos_invalidos", mensaje: "No se pudo leer lo enviado." });
    console.error(error);
    res.status(500).json({ codigo: "error", mensaje: "Algo falló de nuestro lado. Intenta de nuevo." });
  });

  return app;
}
