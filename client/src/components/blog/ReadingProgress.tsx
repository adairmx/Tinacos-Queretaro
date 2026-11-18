import { useEffect, useState } from "react";

/** Barra fina arriba que avanza conforme se lee el artículo. */
export function ReadingProgress() {
  const [avance, setAvance] = useState(0);

  useEffect(() => {
    const medir = () => {
      const article = document.querySelector("article");
      if (!article) return;
      const { top, height } = article.getBoundingClientRect();
      const recorrido = height - window.innerHeight;
      setAvance(recorrido > 0 ? Math.min(1, Math.max(0, -top / recorrido)) : 1);
    };
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      window.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent" aria-hidden>
      <div className="h-full origin-left bg-accent transition-transform duration-75" style={{ transform: `scaleX(${avance})` }} />
    </div>
  );
}
