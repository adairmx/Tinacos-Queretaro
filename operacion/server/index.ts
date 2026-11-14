import { config } from "./config.ts";
import { abrirDb } from "./db.ts";
import { crearApp } from "./app.ts";
import { crearModeloClaude } from "./agente/claude.ts";
import { crearWhatsApp } from "./lib/whatsapp.ts";
import { despacharAvisos } from "./repos/despacho.ts";
import { generarAvisosProgramados } from "./repos/programados.ts";
import { avisarSinProveedor } from "./repos/servicios.ts";

// La clave de administración la pone el dueño en el servidor; sin ella todo lo demás funciona y nadie entra al panel.
if (!config.adminPassword) console.warn("Falta ADMIN_PASSWORD: nadie puede entrar a administración hasta que se configure.");

const db = await abrirDb(config.databaseUrl ? { url: config.databaseUrl } : { carpeta: config.carpetaDeDatos });
// Con WhatsApp conectado, los avisos pendientes salen solos; sin él se quedan en el panel para mandarlos a mano.
const { token, phoneNumberId } = config.whatsapp;
const whatsapp = token && phoneNumberId ? crearWhatsApp({ token, phoneNumberId }) : undefined;
// El agente necesita la llave de Claude; sin ella el panel dice qué falta.
const modelo = config.agente.configurado ? crearModeloClaude() : undefined;

const servidor = crearApp(db, { whatsapp, modelo }).listen(config.puerto, () => {
  console.log(`Operación de tinacos en http://localhost:${config.puerto} (${config.databaseUrl ? "Postgres" : `Postgres local en ${config.carpetaDeDatos}`})`);
});

// Cada minuto: avisa a la casa de los servicios que nadie tomó y genera las confirmaciones y recordatorios que tocan.
const vigia = setInterval(() => {
  avisarSinProveedor(db, config.minutosSinProveedor).catch((error) => console.error("Vigía de servicios sin proveedor:", error));
  generarAvisosProgramados(db).catch((error) => console.error("Vigía de avisos programados:", error));
}, 60_000);

let despachando = false;
const cartero = setInterval(() => {
  if (!whatsapp || despachando) return;
  despachando = true;
  despacharAvisos(db, whatsapp)
    .catch((error) => console.error("Envío de avisos por WhatsApp:", error))
    .finally(() => (despachando = false));
}, 10_000);
console.log(whatsapp ? "WhatsApp conectado: los avisos salen solos." : "WhatsApp sin conectar: los avisos se mandan a mano desde el panel.");
console.log(!modelo ? "Agente sin llave de Claude: no puede contestar." : config.agente.activo && whatsapp ? "Agente activo: contesta solo los WhatsApp de quien pide informes." : "Agente listo para el simulador; no contesta solo.");

// Al apagar se deja de aceptar gente nueva y se termina lo que esté en curso antes de cerrar la base.
for (const senal of ["SIGTERM", "SIGINT"] as const) {
  process.once(senal, () => {
    clearInterval(vigia);
    clearInterval(cartero);
    servidor.close(() => void db.cerrar().finally(() => process.exit(0)));
  });
}
