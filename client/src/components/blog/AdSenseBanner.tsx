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
  /** `rejilla`: dentro de la rejilla de artículos, con la altura de una tarjeta. */
  variant?: "articulo" | "rejilla";
}

export default function AdSenseBanner({ slot, className = "", variant = "articulo" }: AdSenseBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    ensureAdSenseScript();

    // AdSense marca el bloque con este atributo; evita pedir dos veces el mismo anuncio.
    if (!adRef.current || adRef.current.getAttribute("data-adsbygoogle-status")) return;

    try {
      // Debe ser el arreglo global: la cola se procesa cuando termina de cargar el script.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("AdSense push:", err);
    }
  }, []);

  // El espacio se aparta desde antes (min-height) para que el texto no brinque cuando llega el anuncio;
  // si Google no tiene anuncio, `index.css` esconde todo el bloque (data-ad-status="unfilled").
  const rejilla = variant === "rejilla";
  return (
    <aside
      aria-label="Publicidad"
      className={`adsense-container not-prose clear-both w-full text-center ${
        rejilla ? "flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50/60 p-3" : "mx-auto my-10 max-w-3xl"
      } ${className}`}
    >
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">Publicidad</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: rejilla ? "280px" : "250px", width: "100%" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
