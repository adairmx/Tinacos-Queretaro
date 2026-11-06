import { useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { citiesData } from "@/data/citiesData";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import WhatsAppButton from "@/components/sections/WhatsAppButton";
import MobileActionFooter from "@/components/sections/MobileActionFooter";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Check, 
  ShieldCheck, 
  Clock, 
  PhoneCall, 
  MessageCircle, 
  Star, 
  Sparkles, 
  ChevronRight,
  AlertTriangle,
  HelpCircle,
  ThumbsUp
} from "lucide-react";
import heroBg from "@assets/generated_images/clean_blue_water_surface_background.webp";
import heroBgFallback from "@assets/generated_images/clean_blue_water_surface_background.png";

export default function CityPage() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const location = useLocation();

  // Si no viene en params, obtenerlo de la ruta directa /cdmx, /guadalajara, etc.
  const pathSegment = location.pathname.replace(/^\/(ciudades\/)?/, "").split("/")[0]?.toLowerCase();
  const slug = (citySlug || pathSegment || "").toLowerCase();
  const city = citiesData[slug];

  useEffect(() => {
    if (city) {
      document.title = city.seoTitle;
      
      // Actualizar meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", city.seoDescription);

      // JSON-LD LocalBusiness Schema para SEO Local de Google
      const scriptId = "local-seo-schema";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        "name": `MonsterCo - Lavado de Tinacos y Cisternas en ${city.name}`,
        "description": city.seoDescription,
        "telephone": "+524425016667",
        "url": window.location.href,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city.name,
          "addressRegion": city.state,
          "addressCountry": "MX"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": city.geoCoordinates.latitude,
          "longitude": city.geoCoordinates.longitude
        },
        "areaServed": city.zones,
        "priceRange": "$1,050 - $2,200 MXN",
        "serviceType": [
          "Lavado de tinacos",
          "Lavado de cisternas",
          "Lavado de aljibes",
          "Desinfección de depósitos de agua potable"
        ]
      });
    }

    return () => {
      // Limpiar al desmontar
      const schemaScript = document.getElementById("local-seo-schema");
      if (schemaScript) schemaScript.remove();
    };
  }, [city]);

  if (!city) {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Ciudad no encontrada</h1>
          <p className="text-muted-foreground mb-8">
            Actualmente contamos con cobertura en Querétaro, CDMX, Guadalajara, Puebla y Monterrey.
          </p>
          <Button asChild>
            <Link to="/">Volver al inicio</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const defaultMsg = encodeURIComponent(
    `Hola, vi su servicio de lavado de tinacos y cisternas en ${city.name}. Me gustaría cotizar para mi domicilio.`
  );

  return (
    <div className="min-h-screen bg-background font-sans pb-16 md:pb-0">
      <Navbar />

      <main>
        {/* HERO LOCAL */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <picture>
              <source srcSet={heroBg} type="image/webp" />
              <img
                src={heroBgFallback}
                alt={`Lavado de tinacos y cisternas en ${city.name}`}
                className="w-full h-full object-cover"
                width="1920"
                height="1080"
                fetchPriority="high"
              />
            </picture>
            <div className="absolute inset-0 bg-primary/50 mix-blend-multiply" />
            <div className="absolute inset-0 bg-black/25" />
          </div>

          <div className="container relative z-10 px-4 mx-auto text-center text-white py-16">
            <div className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-accent text-white text-xs md:text-sm font-bold mb-6 shadow-md animate-in fade-in">
              <Sparkles className="h-4 w-4" />
              <span>{city.heroBadge}</span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl md:text-6xl lg:text-7xl leading-tight mb-6 drop-shadow-lg">
              {city.heroHeading} <br />
              <span className="text-secondary">{city.heroHighlight}</span>
            </h1>

            <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto mb-8 drop-shadow-md leading-relaxed">
              {city.heroSubtitle}
            </p>

            {/* Botones de acción principales */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Button
                size="lg"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg px-8 h-14 w-full shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 rounded-2xl"
                asChild
              >
                <a
                  href={`https://wa.me/5214425016667?text=${defaultMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-6 w-6 fill-current" />
                  Cotizar por WhatsApp
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/50 backdrop-blur-md h-14 w-full font-bold flex items-center justify-center gap-2 rounded-2xl"
                asChild
              >
                <a href="tel:+524425016667">
                  <PhoneCall className="h-5 w-5" />
                  Llamar Directo
                </a>
              </Button>
            </div>

            {/* Badges de confianza */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs md:text-sm font-semibold text-white/90">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-green-400" /> Cero anticipos
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> 4.9/5 Calificación
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400" /> Garantía de agua pura
              </span>
            </div>
          </div>
        </section>

        {/* PRECIOS TRANSPARENTES LOCALES */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <span className="text-accent text-xs font-bold uppercase tracking-widest">
                Tarifas Garantizadas en {city.name}
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2">
                Precios Fijos y Transparentes
              </h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm md:text-base">
                Sin cargos ocultos ni sorpresas. Pago contra entrega al comprobar que tu depósito quedó impecable.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Tinaco */}
              <div className="bg-card rounded-3xl p-8 border border-border shadow-md flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div>
                  <h3 className="font-bold text-xl mb-1">Lavado de Tinaco</h3>
                  <div className="text-3xl font-extrabold text-primary mb-2">$1,050 <span className="text-xs text-muted-foreground font-normal">MXN</span></div>
                  <p className="text-xs text-muted-foreground mb-6">Para tinacos residenciales de hasta 1,100L en azotea.</p>

                  <ul className="space-y-3 mb-8 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Tallado a presión interior</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Desinfección con grado bactericida</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Revisión de flotador y válvula</span>
                    </li>
                  </ul>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl" asChild>
                  <a
                    href={`https://wa.me/5214425016667?text=${encodeURIComponent(`Hola, me interesa agendar el lavado de Tinaco ($1,050) en ${city.name}`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Agendar Tinaco
                  </a>
                </Button>
              </div>

              {/* Combo Dúo (Destacado) */}
              <div className="bg-card rounded-3xl p-8 border-2 border-accent shadow-xl relative flex flex-col justify-between scale-102 bg-gradient-to-b from-accent/5 to-card">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  Paquete Más Solicitado
                </div>

                <div>
                  <h3 className="font-bold text-xl mb-1">Paquete Dúo</h3>
                  <div className="text-3xl font-extrabold text-accent mb-2">$2,200 <span className="text-xs text-muted-foreground font-normal">MXN</span></div>
                  <p className="text-xs text-green-600 font-bold mb-6">Ahorras $200 al contratar tinaco + cisterna juntos.</p>

                  <ul className="space-y-3 mb-8 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Tinaco (1,100L) + Cisterna (hasta 5,000L)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Extracción con bomba sumergible de achique</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Desinfección profunda total</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Revisión de bomba e hidroneumático</span>
                    </li>
                  </ul>
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-12 rounded-xl shadow-md" asChild>
                  <a
                    href={`https://wa.me/5214425016667?text=${encodeURIComponent(`Hola, me interesa el Paquete Dúo de Tinaco y Cisterna ($2,200) en ${city.name}`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Agendar Paquete Dúo
                  </a>
                </Button>
              </div>

              {/* Cisterna */}
              <div className="bg-card rounded-3xl p-8 border border-border shadow-md flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div>
                  <h3 className="font-bold text-xl mb-1">Lavado de Cisterna</h3>
                  <div className="text-3xl font-extrabold text-primary mb-2">$1,350 <span className="text-xs text-muted-foreground font-normal">MXN</span></div>
                  <p className="text-xs text-muted-foreground mb-6">Para cisternas o aljibes residenciales de hasta 5,000L.</p>

                  <ul className="space-y-3 mb-8 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Extracción completa de sedimentos y lodos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Lavado a presión de muros, fondo y losa</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Desinfección antibacteriana grado alimenticio</span>
                    </li>
                  </ul>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl" asChild>
                  <a
                    href={`https://wa.me/5214425016667?text=${encodeURIComponent(`Hola, me interesa agendar el lavado de Cisterna ($1,350) en ${city.name}`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Agendar Cisterna
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEMA LOCAL DE AGUA (SEO EEAT) */}
        <section className="py-16 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-card p-8 md:p-10 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start gap-6">
              <div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl flex-shrink-0">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-3">
                  {city.localWaterProblemTitle}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {city.localWaterProblemDesc}
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-foreground/80">
                  <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border">
                    <ThumbsUp className="h-3.5 w-3.5 text-primary" /> Agua cristalina garantizada
                  </span>
                  <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Servicio en menos de 3 horas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ZONAS Y COLONIAS CUBIERTAS (SEO LOCAL KEYWORDS) */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-10">
              <span className="text-accent text-xs font-bold uppercase tracking-widest">
                Cobertura Completa
              </span>
              <h2 className="font-heading text-3xl font-bold text-foreground mt-1">
                Zonas y Colonias que Cubrimos en {city.name}
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                Nuestras cuadrillas locales cuentan con equipo móvil para llegar a tu domicilio puntualmente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {city.zones.map((zone, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-card rounded-2xl border border-border/60 hover:border-primary/40 transition-colors flex items-center gap-3 text-sm font-medium text-foreground/90 shadow-2xs"
                >
                  <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>{zone}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center text-xs text-muted-foreground">
              ¿No ves tu colonia en la lista? Escríbenos por WhatsApp; cubrimos toda el área metropolitana de {city.name}.
            </div>
          </div>
        </section>

        {/* PREGUNTAS FRECUENTES LOCALES */}
        <section className="py-16 bg-muted/20 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <span className="text-accent text-xs font-bold uppercase tracking-widest">Dudas Frecuentes</span>
              <h2 className="font-heading text-3xl font-bold text-foreground mt-1">
                Preguntas Frecuentes en {city.name}
              </h2>
            </div>

            <div className="space-y-4">
              {city.faqs.map((faq, idx) => (
                <div key={idx} className="bg-card p-6 rounded-2xl border shadow-2xs">
                  <h3 className="font-bold text-base text-foreground mb-2 flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-muted-foreground text-sm pl-7 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BANNER FINAL DE CONVERSIÓN */}
        <section className="py-16 bg-gradient-to-r from-primary to-slate-900 text-white text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">
              ¿Listo para tener agua limpia y segura en {city.name}?
            </h2>
            <p className="text-white/80 mb-8 text-base">
              Agenda tu cita hoy mismo. Respondemos en menos de 5 minutos por WhatsApp.
            </p>
            <Button
              size="lg"
              className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg px-8 h-14 shadow-2xl rounded-2xl"
              asChild
            >
              <a
                href={`https://wa.me/5214425016667?text=${defaultMsg}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-6 w-6 mr-2 fill-current" />
                Agendar Mi Servicio en {city.name}
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      {/* Botones móviles responsivos adaptados a la ciudad */}
      <MobileActionFooter whatsappNumber="5214425016667" />
    </div>
  );
}
