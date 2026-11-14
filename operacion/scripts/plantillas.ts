/**
 * Plantillas de WhatsApp que el sistema necesita aprobadas en Meta.
 *
 *   npm run plantillas                 las imprime, para darlas de alta a mano en Meta Business
 *   npm run plantillas -- --registrar  las da de alta por la API (pide WHATSAPP_TOKEN y WHATSAPP_WABA_ID)
 *
 * Registrar por la API no se ha probado contra Meta: si alguna falla, dala de alta a mano con el texto impreso.
 */
import { config } from "../server/config.ts";
import { IDIOMA, PLANTILLAS } from "../server/lib/plantillas.ts";

const registrar = process.argv.includes("--registrar");
const { token, wabaId } = config.whatsapp;

if (registrar && (!token || !wabaId)) {
  console.error("Para registrar faltan WHATSAPP_TOKEN y WHATSAPP_WABA_ID en el .env");
  process.exit(1);
}

for (const plantilla of Object.values(PLANTILLAS)) {
  console.log(`\n${plantilla.nombre}  ·  ${plantilla.categoria}  ·  ${IDIOMA}`);
  console.log(`  ${plantilla.cuerpo}`);
  plantilla.ejemplo.forEach((valor, i) => console.log(`  {{${i + 1}}} ejemplo: ${valor}`));

  if (!registrar) continue;
  const respuesta = await fetch(`https://graph.facebook.com/v20.0/${wabaId}/message_templates`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: plantilla.nombre,
      language: IDIOMA,
      category: plantilla.categoria,
      components: [{ type: "BODY", text: plantilla.cuerpo, example: { body_text: [plantilla.ejemplo] } }],
    }),
  });
  const datos = (await respuesta.json().catch(() => ({}))) as { id?: string; status?: string; error?: { message?: string } };
  console.log(respuesta.ok ? `  → registrada (${datos.status ?? "en revisión"})` : `  → Meta la rechazó: ${datos.error?.message ?? respuesta.status}`);
}
