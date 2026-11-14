import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, ChevronDown } from "lucide-react";
import { citiesData } from "@shared/cities";

interface CitySelectorProps {
  className?: string;
}

export default function CitySelector({ className = "" }: CitySelectorProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Detectar la ciudad actual según la ruta
  const pathSegment = location.pathname.replace(/^\/(ciudades\/)?/, "").split("/")[0]?.toLowerCase();
  const currentCityKey = pathSegment && citiesData[pathSegment] ? pathSegment : "queretaro";

  const currentCityLabel = 
    currentCityKey === "queretaro"
      ? "Querétaro"
      : citiesData[currentCityKey]?.name || "Seleccionar Ciudad";

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === "queretaro") {
      navigate("/");
    } else {
      navigate(`/${selected}`);
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 text-xs font-bold text-foreground transition-all cursor-pointer">
        <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
        <span className="truncate max-w-[140px] sm:max-w-none">{currentCityLabel}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
      </div>

      {/* Select nativo invisible superpuesto para máxima compatibilidad móvil y táctil */}
      <select
        value={currentCityKey}
        onChange={handleCityChange}
        aria-label="Seleccionar ciudad de cobertura"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
      >
        <option value="queretaro">📍 Santiago de Querétaro (Base)</option>
        <option disabled>──────────</option>
        <option value="cdmx">📍 Ciudad de México (CDMX)</option>
        <option value="edomex">📍 Estado de México (Edomex)</option>
        <option value="guadalajara">📍 Guadalajara y Zapopan</option>
        <option value="monterrey">📍 Monterrey y San Pedro</option>
        <option value="puebla">📍 Puebla y Cholula</option>
        <option value="toluca">📍 Toluca y Metepec</option>
        <option value="cuernavaca">📍 Cuernavaca y Jiutepec</option>
        <option value="leon">📍 León Guanajuato</option>
        <option value="merida">📍 Mérida Yucatán</option>
        <option value="san-luis-potosi">📍 San Luis Potosí</option>
        <option value="aguascalientes">📍 Aguascalientes</option>
        <option value="cancun">📍 Cancún y Playa del Carmen</option>
      </select>
    </div>
  );
}

