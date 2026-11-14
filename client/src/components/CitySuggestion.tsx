import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, X } from "lucide-react";
import { citiesData } from "@shared/cities";

const DISMISSED_KEY = "ciudad-sugerida:cerrada";
const QUERETARO = "queretaro";

interface Suggestion {
  name: string;
  href: string;
}

function toSuggestion(slug: string | null | undefined): Suggestion | null {
  if (slug === QUERETARO) return { name: "Querétaro", href: "/" };
  const city = slug && Object.hasOwn(citiesData, slug) ? citiesData[slug] : undefined;
  return city ? { name: city.name, href: `/${city.slug}` } : null;
}

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Franja que ofrece la página de la ciudad desde donde se conecta la visita.
 * Es una invitación y no un salto automático: la ubicación por conexión falla seguido con datos móviles.
 * ?ciudad=cdmx la muestra sin consultar la ubicación, para probarla.
 */
export default function CitySuggestion({ currentCity }: { currentCity?: string }) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get("ciudad");
    if (forced) return setSuggestion(toSuggestion(forced));
    if (wasDismissed()) return;

    const controller = new AbortController();
    fetch("/api/geo", { signal: controller.signal })
      .then((response) => response.json())
      .then(({ city }: { city: string | null }) => {
        if (city !== (currentCity ?? null)) setSuggestion(toSuggestion(city));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [currentCity]);

  if (!suggestion) return null;

  const dismiss = () => {
    setSuggestion(null);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Sin almacenamiento solo se oculta en esta visita.
    }
  };

  return (
    <div className="bg-accent text-white" data-testid="city-suggestion">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
        <Link to={suggestion.href} className="flex items-center gap-1.5 font-semibold hover:underline min-w-0">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">Lavado de tinacos y cisternas en {suggestion.name}</span>
          <span className="hidden sm:inline font-bold whitespace-nowrap">· Ver servicio</span>
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar sugerencia de ciudad"
          className="ml-2 p-1 rounded-full hover:bg-white/20 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
