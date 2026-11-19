import { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-6155360579424146";
export const ADSENSE_SCRIPT_ID = "google-adsense-script";

export const AD_SLOTS = {
  article1: "6386158878",
  article2: "1820227908",
  article3: "2049513958",
} as const;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function ensureAdSenseScript() {
  if (document.getElementById(ADSENSE_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = ADSENSE_SCRIPT_ID;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
  script.async = true;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

interface AdSenseBannerProps {
  slot: string;
  className?: string;
  /**
   * `rejilla`: dentro de la rejilla de artículos, con la altura de una tarjeta.
   * `chico`: banda horizontal baja (~100 px) para la primera pantalla del celular.
   */
  variant?: "articulo" | "rejilla" | "chico";
}

export default function AdSenseBanner({ slot, className = "", variant = "articulo" }: AdSenseBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    ensureAdSenseScript();
    const ins = adRef.current;
    if (!ins) return;

    const pedir = () => {
      // AdSense marca el bloque con este atributo; evita pedir dos veces el mismo anuncio.
      if (ins.getAttribute("data-adsbygoogle-status")) return;
      try {
        // Debe ser el arreglo global: la cola se procesa cuando termina de cargar el script.
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.warn("AdSense push:", err);
      }
    };

    // Con un anuncio por pantalla hay 10 o más en un artículo: se pide cada uno cuando el lector
    // está a una pantalla y media de llegar. Así Google no recibe todos de golpe (llena menos y cuenta
    // impresiones que nadie ve) y los que llegan vacíos se esconden antes de que el lector pase por ahí.
    if (!("IntersectionObserver" in window)) {
      pedir();
      return;
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          observador.disconnect();
          pedir();
        }
      },
      { rootMargin: "150% 0px" },
    );
    observador.observe(ins);
    return () => observador.disconnect();
  }, []);

  // El espacio se aparta desde antes (min-height) para que el texto no brinque cuando llega el anuncio;
  // si Google no tiene anuncio, `index.css` esconde todo el bloque (data-ad-status="unfilled").
  const rejilla = variant === "rejilla";
  const chico = variant === "chico";
  const contenedor = rejilla
    ? "flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50/60 p-3"
    : chico
      ? "mb-6"
      : "mx-auto my-10 max-w-3xl";
  return (
    <aside aria-label="Publicidad" className={`adsense-container not-prose clear-both w-full text-center ${contenedor} ${className}`}>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">Publicidad</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          ...(chico ? { height: "100px" } : { minHeight: rejilla ? "280px" : "250px" }),
        }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={chico ? "horizontal" : "auto"}
        // En el chico no: Google lo agrandaría a lo ancho y alto de la pantalla y empujaría el artículo.
        data-full-width-responsive={chico ? "false" : "true"}
      />
    </aside>
  );
}
