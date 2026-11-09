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
}

export default function AdSenseBanner({ slot, className = "" }: AdSenseBannerProps) {
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

  return (
    <aside
      aria-label="Publicidad"
      className={`adsense-container not-prose my-8 w-full max-w-3xl mx-auto text-center clear-both ${className}`}
    >
      <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400 block mb-1">
        Publicidad
      </span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: "250px", width: "100%" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
