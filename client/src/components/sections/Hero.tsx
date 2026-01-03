import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBg from "@assets/generated_images/clean_blue_water_surface_background.png";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Agua limpia y cristalina - Lavado de tinacos en Querétaro" 
          className="w-full h-full object-cover"
          width="1920"
          height="1080"
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 mx-auto text-center text-white">
        <span className="inline-block py-1 px-3 rounded-full bg-accent/90 text-white text-sm font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Servicio #1 en Querétaro
        </span>
        <h1 className="font-heading font-extrabold text-4xl md:text-6xl lg:text-7xl leading-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 drop-shadow-lg">
          Lavado de Tinacos<br />
          <span className="text-secondary">y Cisternas en Querétaro</span>
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 drop-shadow-md">
          Servicio profesional de limpieza y desinfección de tinacos y cisternas. 
          Rápido, garantizado y con los mejores precios en todo Querétaro.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold text-lg px-8 h-14 w-full sm:w-auto shadow-lg hover:scale-105 transition-transform" asChild>
            <a href="https://wa.me/5214425016667?text=Hola,%20quiero%20cotizar%20mi%20servicio" target="_blank" rel="noopener noreferrer">
              Cotizar por WhatsApp
            </a>
          </Button>
          <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-sm h-14 w-full sm:w-auto" asChild>
            <a href="#services">
              Ver Servicios <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Wave Divider removed */}
    </section>
  );
}
