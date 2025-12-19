import { MapPin } from "lucide-react";

export default function ServiceZones() {
  const zones = [
    "Centro Histórico",
    "Juriquilla",
    "El Refugio",
    "Zibatá",
    "Milenio III",
    "Candiles",
    "El Pueblito",
    "Jurica",
    "Álamos",
    "Jardines de la Hacienda",
    "Cimatario",
    "San José el Alto"
  ];

  return (
    <section id="zones" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-6">
              Cobertura en todo Querétaro
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Llegamos a las principales zonas residenciales y comerciales de la ciudad de Querétaro y zona metropolitana.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {zones.map((zone, index) => (
                <div key={index} className="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-colors cursor-default">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="font-medium">{zone}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm text-primary font-semibold">
                ¿No ves tu zona en la lista? Contáctanos para confirmar cobertura.
              </p>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 h-[400px] rounded-2xl overflow-hidden shadow-lg border border-border bg-white p-2">
            {/* Abstract Map Representation since we don't have a real map API key yet */}
            <div className="w-full h-full bg-[#E5E3DF] relative rounded-xl overflow-hidden group">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#444cf7_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping"></div>
                  <div className="relative bg-primary text-white p-3 rounded-full shadow-xl">
                    <MapPin className="h-8 w-8" />
                  </div>
                </div>
              </div>
              
              {/* Decorative Pins */}
              <div className="absolute top-1/4 left-1/4 text-accent animate-bounce duration-[2000ms]">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="absolute bottom-1/3 right-1/4 text-accent animate-bounce duration-[2500ms] delay-100">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="absolute top-1/3 right-1/3 text-accent animate-bounce duration-[3000ms] delay-300">
                <MapPin className="h-6 w-6" />
              </div>
              
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-bold text-muted-foreground shadow-sm">
                Mapa de Cobertura
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
