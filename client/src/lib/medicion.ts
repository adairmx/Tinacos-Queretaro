/**
 * Medición para anuncios: píxel de Meta y etiqueta de Google (GA4 y, si hay, Google Ads).
 *
 * Los IDs son públicos (cualquiera los ve en el código de la página), por eso viven aquí y no en variables
 * secretas. Mientras un ID esté vacío, su script no se carga y sus eventos no salen.
 *
 * Eventos que se mandan:
 * - Contacto: tocar cualquier botón de WhatsApp o de llamada (Meta `Contact`, Google `contacto`).
 * - Lead: mandar el formulario de contacto o el cotizador (Meta `Lead`, Google `generate_lead`).
 * Cada uno lleva la ciudad de la página y, si se sabe, el paquete.
 */
/** «Píxel de Lavado de tinacos», portafolio Icarus MKT. Es el mismo que usaba el sitio de WordPress hasta 2025. */
export const META_PIXEL_ID = "1290915891112062";
/** Propiedad «Lavado de Tinacos Qro - GA4» (cuenta Clientes Icarus MKT), flujo https://lavadotinacos.com/. */
export const GA4_ID = "G-KVT544CE3T";
/** Google Ads, formato `AW-123456789`. */
export const GOOGLE_ADS_ID = "";
/** Etiqueta de la conversión de Google Ads para un lead, formato `AW-123456789/AbCdEf`. Opcional. */
export const GOOGLE_ADS_LEAD = "";

type Datos = Record<string, string | number | undefined>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const PRODUCCION = typeof window !== "undefined" && /(^|\.)lavadotinacos\.com$/.test(window.location.hostname);

function cargarScript(src: string) {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function iniciarMeta() {
  if (!META_PIXEL_ID || window.fbq) return;
  // Igual que el fragmento oficial de Meta: una cola que fbevents.js vacía al cargar.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fbq: any = function (this: unknown) {
    // eslint-disable-next-line prefer-rest-params
    fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  cargarScript("https://connect.facebook.net/en_US/fbevents.js");
  fbq("init", META_PIXEL_ID);
}

function iniciarGoogle() {
  const principal = GA4_ID || GOOGLE_ADS_ID;
  if (!principal || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag necesita el objeto `arguments`, no un arreglo.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  cargarScript(`https://www.googletagmanager.com/gtag/js?id=${principal}`);
  window.gtag("js", new Date());
  // La vista de página la mandamos a mano en cada cambio de ruta, porque el sitio no recarga la página.
  if (GA4_ID) window.gtag("config", GA4_ID, { send_page_view: false });
  if (GOOGLE_ADS_ID) window.gtag("config", GOOGLE_ADS_ID);
}

/** Ciudad según la página: la portada es Querétaro. */
export function ciudadDeLaPagina(ruta = window.location.pathname) {
  const slug = ruta.replace(/^\/(ciudades\/)?/, "").split("/")[0];
  return !slug ? "queretaro" : slug;
}

function paqueteDelTexto(texto: string) {
  if (/d[uú]o|ambos|tinaco y cisterna/i.test(texto)) return "duo";
  if (/cisterna|aljibe/i.test(texto)) return "cisterna";
  if (/tinaco/i.test(texto)) return "tinaco";
  return undefined;
}

export function vistaDePagina(ruta: string) {
  if (!PRODUCCION) return;
  window.fbq?.("track", "PageView");
  if (GA4_ID) window.gtag?.("event", "page_view", { page_path: ruta, page_location: window.location.href, send_to: GA4_ID });
}

export function contacto(canal: "whatsapp" | "telefono", extra: Datos = {}) {
  const datos: Datos = { ciudad: ciudadDeLaPagina(), canal, ...extra };
  if (!PRODUCCION) return void console.debug("[medición] contacto", datos);
  window.fbq?.("track", "Contact", { content_category: datos.ciudad, content_name: datos.paquete, canal });
  window.gtag?.("event", "contacto", datos);
}

export function lead(origen: string, extra: Datos = {}) {
  const datos: Datos = { ciudad: ciudadDeLaPagina(), origen, currency: "MXN", ...extra };
  if (!PRODUCCION) return void console.debug("[medición] lead", datos);
  window.fbq?.("track", "Lead", { content_category: datos.ciudad, content_name: datos.paquete, value: datos.value, currency: "MXN" });
  window.gtag?.("event", "generate_lead", datos);
  if (GOOGLE_ADS_LEAD) window.gtag?.("event", "conversion", { send_to: GOOGLE_ADS_LEAD, value: datos.value, currency: "MXN" });
}

/** Carga los scripts y escucha los clics en botones de WhatsApp y de llamada de todo el sitio. */
export function iniciarMedicion() {
  if (typeof window === "undefined") return;
  if (PRODUCCION) {
    iniciarMeta();
    iniciarGoogle();
  }
  document.addEventListener(
    "click",
    (evento) => {
      const enlace = (evento.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!enlace) return;
      const href = enlace.href;
      if (/wa\.me|api\.whatsapp\.com|whatsapp:\/\//i.test(href)) {
        let texto = "";
        try {
          texto = new URL(href).searchParams.get("text") ?? "";
        } catch {
          /* enlace raro: se cuenta igual, sin paquete */
        }
        contacto("whatsapp", { paquete: paqueteDelTexto(texto + " " + enlace.innerText) });
      } else if (href.startsWith("tel:")) {
        contacto("telefono");
      }
    },
    true,
  );
}
