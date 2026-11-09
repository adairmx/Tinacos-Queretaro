import { ArrowRight, Check, MapPin, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuickQuoteCard from "@/components/sections/QuickQuoteCard";
import heroBg from "@assets/generated_images/clean_blue_water_surface_background.webp";
import heroBgFallback from "@assets/generated_images/clean_blue_water_surface_background.png";

const PROMISES = ["Cero anticipos", "Precios fijos", "Pago contra entrega"];

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0" aria-hidden="true">
        <picture>
          <source srcSet={heroBg} type="image/webp" />
          <img
            src={heroBgFallback}
            alt=""
            className="w-full h-full object-cover"
            width="1920"
            height="1080"
            fetchPriority="high"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-primary/30" />
      </div>

      <div className="container relative z-10 mx-auto px-4 pt-12 pb-28 lg:pt-20 lg:pb-36 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] gap-10 lg:gap-16 items-center">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm font-semibold mb-6">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            Querétaro y 12 ciudades de México
          </span>

          <h1 className="font-heading font-extrabold text-4xl md:text-5xl xl:text-6xl leading-[1.08] mb-6">
            Lavado de Tinacos y Cisternas,{" "}
            <span className="text-secondary">sin sorpresas en el precio</span>
          </h1>

          <p className="text-lg md:text-xl text-white/85 max-w-xl mb-8">
            Sacamos el lodo, lavamos a presión y desinfectamos tu depósito para que el agua de tu
            casa vuelva a estar limpia.
          </p>

          <ul className="flex flex-wrap gap-x-6 gap-y-3 mb-9">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
                  <Check className="h-4 w-4 text-white" aria-hidden="true" />
                </span>
                {promise}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white hover:text-white border-white/40 backdrop-blur-sm h-12" asChild>
              <a href="tel:+524425016667">
                <PhoneCall className="mr-2 h-4 w-4" aria-hidden="true" />
                Llamar ahora
              </a>
            </Button>
            <Button size="lg" variant="ghost" className="text-white hover:text-white hover:bg-white/10 h-12" asChild>
              <a href="#proceso">
                Cómo trabajamos
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>

        <div className="text-foreground animate-in fade-in slide-in-from-bottom-10 duration-700 delay-150">
          <QuickQuoteCard />
        </div>
      </div>

      <svg
        className="absolute bottom-0 left-0 z-10 w-full h-12 md:h-20 fill-background"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,48 C240,88 480,8 720,40 C960,72 1200,24 1440,52 L1440,80 L0,80 Z" />
      </svg>
    </section>
  );
}
