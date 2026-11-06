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
    // Evitar múltiples llamadas en el mismo montaje
    if (pushedRef.current) return;

    try {
      if (typeof window !== "undefined") {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        pushedRef.current = true;
      }
    } catch (err) {
      console.warn("AdSense push error (normal en React re-renders):", err);
    }
  }, []);

  return (
    <div className={`adsense-container my-8 w-full text-center overflow-hidden clear-both ${className}`}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 block mb-1">
        Publicidad
      </span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: "90px" }}
        data-ad-client="ca-pub-6155360579424146"
        data-ad-slot={slot || undefined}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
