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
          alt="Agua limpia y cristalina" 
          className="w-full h-full object-cover"
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
          Agua Limpia,<br />
          <span className="text-secondary">Familia Sana</span>
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 drop-shadow-md">
          Especialistas en lavado y desinfección de tinacos y cisternas. 
          Servicio profesional, rápido y garantizado en todo Querétaro.
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

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-[1px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto text-background fill-current">
          <path fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
}
