import { createHmac, timingSafeEqual } from "node:crypto";
import { normalizarTelefono } from "../../shared/telefono.ts";
import { IDIOMA, PLANTILLAS, type NombreDePlantilla } from "./plantillas.ts";

const GRAPH = "https://graph.facebook.com/v20.0";

/**
 * Errores de la API de WhatsApp de Meta, dichos para quien opera. Mismos códigos que ya maneja Justicia
 * (server/lib/whatsappMeta.js), más los de plantillas.
 */
const MENSAJES: Record<number, string> = {
  131026: "No se pudo entregar: el número no tiene WhatsApp o no aceptó los términos nuevos.",
  131030: "El número de destino no está en la lista permitida de Meta (número de prueba).",
  131031: "Meta bloqueó la cuenta de WhatsApp.",
  131047: "Pasaron más de 24 horas desde el último mensaje de la persona: hace falta una plantilla aprobada.",
  131056: "Demasiados mensajes seguidos a este número.",
  132000: "La plantilla no lleva los valores que Meta espera: revisa que sea igual a la registrada.",
  132001: "La plantilla no existe en Meta o todavía no está aprobada.",
  132007: "Meta rechazó el contenido de la plantilla.",
  132015: "Meta pausó la plantilla por mala calidad.",
  190: "El token de WhatsApp venció o no es válido.",
  368: "Meta bloqueó la cuenta de WhatsApp.",
};

/** Lo que conviene reintentar: fallas de red, de Meta o de ritmo de envío. Lo demás no se arregla repitiendo. */
const REINTENTABLES = new Set([1, 2, 4, 80007, 130429, 131000, 131016, 131056, 133004]);

export class ErrorDeWhatsApp extends Error {
  constructor(
    mensaje: string,
    readonly reintentable: boolean,
    readonly codigo?: number,
  ) {
    super(mensaje);
  }
}

export interface WhatsApp {
  /** Manda una plantilla aprobada a un teléfono mexicano de 10 dígitos; regresa el identificador del mensaje. */
  enviarPlantilla(telefono: string, plantilla: NombreDePlantilla, variables: string[]): Promise<string>;
  /** Manda texto libre. WhatsApp sólo lo permite dentro de las 24 horas siguientes al último mensaje de la persona. */
  enviarTexto(telefono: string, texto: string): Promise<string>;
}

interface Opciones {
  token: string;
  phoneNumberId: string;
  /** Se puede cambiar en las pruebas para no salir a la red. */
  fetchImpl?: typeof fetch;
}

export function crearWhatsApp({ token, phoneNumberId, fetchImpl = fetch }: Opciones): WhatsApp {
  async function mandar(cuerpo: object) {
    let respuesta: Response;
    try {
      respuesta = await fetchImpl(`${GRAPH}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      throw new ErrorDeWhatsApp("No se pudo conectar con WhatsApp.", true);
    }

    const datos = (await respuesta.json().catch(() => ({}))) as { messages?: { id?: string }[]; error?: { code?: number; message?: string } };
    const wamid = datos.messages?.[0]?.id;
    if (respuesta.ok && wamid) return wamid;

    const codigo = datos.error?.code;
    const mensaje = (codigo && MENSAJES[codigo]) || datos.error?.message || `WhatsApp contestó ${respuesta.status}.`;
    throw new ErrorDeWhatsApp(mensaje, respuesta.status >= 500 || (codigo !== undefined && REINTENTABLES.has(codigo)), codigo);
  }

  return {
    enviarPlantilla: (telefono, plantilla, variables) =>
      mandar({
        messaging_product: "whatsapp",
        to: `52${telefono}`,
        type: "template",
        template: {
          name: PLANTILLAS[plantilla].nombre,
          language: { code: IDIOMA },
          components: variables.length ? [{ type: "body", parameters: variables.map((text) => ({ type: "text", text })) }] : [],
        },
      }),
    enviarTexto: (telefono, texto) => mandar({ messaging_product: "whatsapp", to: `52${telefono}`, type: "text", text: { body: texto } }),
  };
}

/** Comprueba que el aviso del webhook lo firmó Meta con el secreto de nuestra app. */
export function firmaValida(cuerpoCrudo: Buffer, firma: string | undefined, appSecret: string) {
  if (!firma?.startsWith("sha256=")) return false;
  const esperada = createHmac("sha256", appSecret).update(cuerpoCrudo).digest();
  const recibida = Buffer.from(firma.slice(7), "hex");
  return recibida.length === esperada.length && timingSafeEqual(recibida, esperada);
}

export interface MensajeEntrante {
  wamid: string;
  telefono: string;
  nombre: string | null;
  texto: string;
}

export interface Acuse {
  wamid: string;
  estado: string;
  error: string | null;
}

const textoDe = (m: any): string => {
  switch (m.type) {
    case "text":
      return m.text?.body ?? "";
    case "button":
      return m.button?.text ?? "";
    case "interactive":
      return m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || "";
    case "image":
    case "video":
    case "document":
      return m[m.type]?.caption || `[${m.type === "image" ? "Foto" : m.type === "video" ? "Video" : "Documento"}]`;
    case "audio":
      return "[Nota de voz]";
    case "location":
      return `[Ubicación] ${m.location?.latitude}, ${m.location?.longitude}`;
    default:
      return "[Mensaje que no se puede mostrar]";
  }
};

/** Saca de un aviso del webhook los mensajes que escribió la gente y los acuses de entrega de lo que mandamos. */
export function leerWebhook(payload: any): { mensajes: MensajeEntrante[]; acuses: Acuse[] } {
  const mensajes: MensajeEntrante[] = [];
  const acuses: Acuse[] = [];
  if (payload?.object !== "whatsapp_business_account") return { mensajes, acuses };

  for (const entrada of payload.entry ?? []) {
    for (const cambio of entrada.changes ?? []) {
      if (cambio.field !== "messages") continue;
      const valor = cambio.value ?? {};
      const nombres = new Map<string, string | null>((valor.contacts ?? []).map((c: any) => [c.wa_id, c.profile?.name ?? null]));

      for (const m of valor.messages ?? []) {
        const telefono = normalizarTelefono(String(m.from ?? ""));
        if (!telefono || !m.id) continue;
        mensajes.push({ wamid: m.id, telefono, nombre: nombres.get(m.from) ?? null, texto: textoDe(m).trim() });
      }
      for (const s of valor.statuses ?? []) {
        if (!s.id) continue;
        const codigo = s.errors?.[0]?.code as number | undefined;
        acuses.push({ wamid: s.id, estado: s.status, error: codigo ? (MENSAJES[codigo] ?? s.errors[0].title ?? `Error ${codigo}`) : null });
      }
    }
  }
  return { mensajes, acuses };
}
