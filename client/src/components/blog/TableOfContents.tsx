import { useEffect, useState } from "react";
import { ChevronDown, List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

const slug = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/** Lee los h2/h3 del artículo, les pone un id legible y marca el que se está leyendo. */
function useHeadings() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;
    // Los títulos de las tarjetas del servicio (`not-prose`) no son parte del artículo.
    const elementos = Array.from(article.querySelectorAll<HTMLElement>("h2, h3")).filter(
      (h) => h.textContent?.trim() && !h.closest(".not-prose"),
    );
    const usados = new Set<string>();
    setHeadings(
      elementos.map((h, i) => {
        let id = h.id || slug(h.textContent || "") || `seccion-${i}`;
        while (usados.has(id)) id = `${id}-${i}`;
        usados.add(id);
        h.id = id;
        return { id, text: h.textContent || "", level: Number(h.tagName[1]) };
      }),
    );

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveId(e.target.id)),
      { rootMargin: "0px 0px -70% 0px" },
    );
    elementos.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  return { headings, activeId };
}

function Lista({ headings, activeId, onPick }: { headings: Heading[]; activeId: string; onPick?: () => void }) {
  return (
    <nav className="space-y-1">
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={onPick}
          className={`block border-l-2 py-1 pl-3 text-sm leading-snug transition-colors ${h.level === 3 ? "ml-3 text-[13px]" : ""} ${
            activeId === h.id
              ? "border-primary font-semibold text-primary"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
          }`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}

/** `lateral`: columna de escritorio. `movil`: desplegable arriba del artículo. */
export function TableOfContents({ variant = "lateral" }: { variant?: "lateral" | "movil" }) {
  const { headings, activeId } = useHeadings();
  const [abierto, setAbierto] = useState(false);
  if (headings.length < 2) return null;

  if (variant === "movil") {
    return (
      <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 lg:hidden">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          aria-expanded={abierto}
        >
          <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <List className="h-4 w-4 text-primary" /> En este artículo
          </span>
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${abierto ? "rotate-180" : ""}`} />
        </button>
        {abierto && (
          <div className="border-t border-slate-200 px-3 pb-3 pt-2">
            <Lista headings={headings} activeId={activeId} onPick={() => setAbierto(false)} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
        <List className="h-3.5 w-3.5" /> En este artículo
      </p>
      <Lista headings={headings} activeId={activeId} />
    </div>
  );
}
