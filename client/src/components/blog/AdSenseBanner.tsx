import { useEffect, useRef } from "react";

interface AdSenseBannerProps {
  slot?: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal";
  responsive?: boolean;
  className?: string;
}

export default function AdSenseBanner({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: AdSenseBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // 1. Asegurar que el script de AdSense esté presente solo cuando se visualiza el blog
    const scriptId = "google-adsense-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6155360579424146";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // 2. Registrar el bloque publicitario una sola vez
    if (!pushedRef.current) {
      try {
        if (typeof window !== "undefined") {
          const adsbygoogle = (window as any).adsbygoogle || [];
          adsbygoogle.push({});
          pushedRef.current = true;
        }
      } catch (err) {
        console.warn("AdSense push:", err);
      }
    }

    // 3. Al desmontar el blog (cuando el usuario regresa a Home):
    // Limpiar cualquier anuncio ancla flotante que Google inyecta en el pie de página
    return () => {
      // Eliminar elementos flotantes inyectados por Google Auto Ads
      const anchors = document.querySelectorAll(
        "ins.adsbygoogle[data-anchor-status], .google-auto-placed, div[id^='aswift_']"
      );
      anchors.forEach((el) => {
        // Solo remover si está fuera del contenedor de contenido principal (anuncios ancla flotantes)
        if (!el.closest("article") && !el.closest(".adsense-container")) {
          el.remove();
        }
      });
    };
  }, []);

  return (
    <div className={`adsense-container my-8 w-full max-w-3xl mx-auto text-center overflow-hidden clear-both ${className}`}>
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
        Publicidad Patrocinada
      </span>
      <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-2 min-h-[250px] flex items-center justify-center">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", minHeight: "250px", width: "100%" }}
          data-ad-client="ca-pub-6155360579424146"
          data-ad-slot={slot || undefined}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </div>
  );
}
