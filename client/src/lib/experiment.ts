import { AB_EXPERIMENT, AB_VARIANTS, type AbEvent, type AbVariant } from "@shared/experiment";

const STORAGE_KEY = `ab:${AB_EXPERIMENT}`;

interface Assignment {
  variant: AbVariant;
  visitorId: string;
  trackable: boolean;
}

let cached: Assignment | undefined;

const isVariant = (value: unknown): value is AbVariant =>
  AB_VARIANTS.includes(value as AbVariant);

const randomVariant = (): AbVariant => (Math.random() < 0.5 ? "classic" : "quote");

function newVisitorId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function resolveAssignment(): Assignment {
  // ?ab=classic o ?ab=quote muestra una versión sin contar en los resultados.
  const forced = new URLSearchParams(window.location.search).get("ab");
  if (isVariant(forced)) return { variant: forced, visitorId: "", trackable: false };

  // Los navegadores automatizados no son clientes.
  const trackable = !navigator.webdriver;

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (isVariant(stored?.variant) && typeof stored?.visitorId === "string") {
      return { variant: stored.variant, visitorId: stored.visitorId, trackable };
    }

    const assignment = { variant: randomVariant(), visitorId: newVisitorId() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignment));
    return { ...assignment, trackable };
  } catch {
    // Sin almacenamiento contaría una visita nueva en cada carga: se muestra pero no se mide.
    return { variant: randomVariant(), visitorId: "", trackable: false };
  }
}

function getAssignment(): Assignment {
  cached ??= resolveAssignment();
  return cached;
}

export const getHomeVariant = (): AbVariant => getAssignment().variant;

export function trackExperiment(event: AbEvent) {
  const { variant, visitorId, trackable } = getAssignment();
  if (!trackable) return;

  const body = JSON.stringify({ experiment: AB_EXPERIMENT, variant, visitorId, event });
  const sent = navigator.sendBeacon?.("/api/ab", new Blob([body], { type: "application/json" }));
  if (!sent) {
    void fetch("/api/ab", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body,
    }).catch(() => undefined);
  }
}

/** Cuenta visita y clics a WhatsApp o teléfono; devuelve la función para dejar de escuchar. */
export function startHomeTracking(): () => void {
  trackExperiment("view");

  const onClick = (event: MouseEvent) => {
    const href = (event.target as Element | null)?.closest?.("a[href]")?.getAttribute("href") ?? "";
    if (href.includes("wa.me")) trackExperiment("whatsapp_click");
    else if (href.startsWith("tel:")) trackExperiment("call_click");
  };

  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
