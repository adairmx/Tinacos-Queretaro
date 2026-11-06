import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calculator, CheckCircle2, MessageCircle, Sparkles, MapPin } from "lucide-react";

export default function QuickQuoteCard() {
  const { toast } = useToast();
  const [city, setCity] = useState("Querétaro");
  const [serviceType, setServiceType] = useState<"tinaco" | "cisterna" | "ambos">("ambos");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [colonia, setColonia] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prices: Record<string, number> = {
    tinaco: 1050,
    cisterna: 1350,
    ambos: 2200,
  };

  const serviceLabels: Record<string, string> = {
    tinaco: "Lavado de Tinaco (hasta 1,100L)",
    cisterna: "Lavado de Cisterna (hasta 5,000L)",
    ambos: "Paquete Dúo (Tinaco + Cisterna)",
  };

  const currentPrice = prices[serviceType];

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Datos requeridos",
        description: "Por favor escribe tu nombre y teléfono para confirmar tu cotización.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Guardar el lead en nuestra base de datos
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: name,
          clientPhone: phone,
          city: city,
          addressColonia: colonia,
          serviceType: serviceType,
          estimatedPrice: currentPrice,
          source: "web_cotizador",
          status: "nuevo",
        }),
      });

      // Redirigir a WhatsApp con el mensaje ya armado
      const text = encodeURIComponent(
        `¡Hola! Acabo de cotizar en el sitio web:\n` +
        `👤 Nombre: ${name}\n` +
        `📍 Ciudad: ${city} (Colonia: ${colonia || "Por definir"})\n` +
        `💧 Servicio: ${serviceLabels[serviceType]}\n` +
        `💵 Precio estimado: $${currentPrice} MXN\n\n` +
        `¿Qué fechas u horarios tienen disponibles para agendar?`
      );

      toast({
        title: "¡Cotización lista!",
        description: "Te estamos conectando con nuestro equipo por WhatsApp...",
      });

      window.open(`https://wa.me/5214425016667?text=${text}`, "_blank");
    } catch {
      toast({
        title: "Conectando...",
        description: "Abriendo WhatsApp para tu cotización inmediata...",
      });
      // Fallback a WhatsApp directo
      const text = encodeURIComponent(
        `Hola, quiero cotizar ${serviceLabels[serviceType]} en ${city}. Mi nombre es ${name}.`
      );
      window.open(`https://wa.me/5214425016667?text=${text}`, "_blank");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-primary/20 max-w-xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-xs">
        <Sparkles className="h-3 w-3" />
        Cotizador Inmediato
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">
            Calcula tu servicio al instante
          </h3>
          <p className="text-xs text-muted-foreground">Precios transparentes garantizados</p>
        </div>
      </div>

      <form onSubmit={handleQuoteSubmit} className="space-y-4">
        {/* Selector de Ciudad */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            1. Selecciona tu Ciudad
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-input bg-muted/20 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="Querétaro">Santiago de Querétaro y Zona Metropolitana</option>
            <option value="Ciudad de México">Ciudad de México (CDMX)</option>
            <option value="Guadalajara">Guadalajara y Zapopan (Jalisco)</option>
            <option value="Puebla">Puebla y Cholula</option>
            <option value="León">León (Guanajuato)</option>
            <option value="Otra Ciudad">Otra Ciudad (Cobertura Nacional)</option>
          </select>
        </div>

        {/* Selector de Servicio */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            2. Tipo de Servicio
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setServiceType("tinaco")}
              className={`p-3 rounded-xl border text-center transition-all ${
                serviceType === "tinaco"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs scale-102"
                  : "border-border bg-background text-muted-foreground hover:border-border/80"
              }`}
            >
              <div className="text-xs font-medium">Tinaco</div>
              <div className="text-sm font-extrabold mt-1">$1,050</div>
            </button>

            <button
              type="button"
              onClick={() => setServiceType("cisterna")}
              className={`p-3 rounded-xl border text-center transition-all ${
                serviceType === "cisterna"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs scale-102"
                  : "border-border bg-background text-muted-foreground hover:border-border/80"
              }`}
            >
              <div className="text-xs font-medium">Cisterna</div>
              <div className="text-sm font-extrabold mt-1">$1,350</div>
            </button>

            <button
              type="button"
              onClick={() => setServiceType("ambos")}
              className={`p-3 rounded-xl border text-center transition-all relative ${
                serviceType === "ambos"
                  ? "border-accent bg-accent/10 text-accent font-bold shadow-xs scale-102"
                  : "border-border bg-background text-muted-foreground hover:border-border/80"
              }`}
            >
              <div className="text-xs font-medium">Dúo (Ambos)</div>
              <div className="text-sm font-extrabold mt-1">$2,200</div>
              <span className="text-[10px] text-green-600 font-bold block">Ahorra $200</span>
            </button>
          </div>
        </div>

        {/* Datos de Contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1">Tu Nombre *</label>
            <Input
              placeholder="Ej. Carlos Mendoza"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1">WhatsApp / Teléfono *</label>
            <Input
              placeholder="Ej. 442 123 4567"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/80 mb-1">Colonia o Fraccionamiento (Opcional)</label>
          <Input
            placeholder="Ej. Juriquilla / El Refugio / Del Valle"
            value={colonia}
            onChange={(e) => setColonia(e.target.value)}
            className="h-10 text-sm"
          />
        </div>

        {/* Resumen y Botón */}
        <div className="pt-2">
          <div className="bg-muted/30 p-3 rounded-xl border flex items-center justify-between mb-3">
            <div>
              <span className="text-xs text-muted-foreground block">Total estimado:</span>
              <span className="font-heading text-2xl font-black text-primary">${currentPrice} MXN</span>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <span className="text-green-600 font-bold flex items-center gap-1 justify-end">
                <CheckCircle2 className="h-3.5 w-3.5" /> Servicio Garantizado
              </span>
              <span>Incluye desinfección profunda</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-base font-bold bg-[#25D366] hover:bg-[#1da851] text-white shadow-lg flex items-center justify-center gap-2 rounded-xl"
          >
            <MessageCircle className="h-5 w-5 fill-current" />
            {isSubmitting ? "Procesando..." : "Apartar Fecha por WhatsApp"}
          </Button>
          <p className="text-[11px] text-center text-muted-foreground mt-2">
            🔒 Tu información se mantendrá segura. Sin compromisos ni pagos por adelantado.
          </p>
        </div>
      </form>
    </div>
  );
}

