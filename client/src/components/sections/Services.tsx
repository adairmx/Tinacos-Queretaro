import { CheckCircle2 } from "lucide-react";
import tinacoImg from "@assets/generated_images/modern_residential_water_tank_on_roof.webp";
import tinacoImgFallback from "@assets/generated_images/modern_residential_water_tank_on_roof.png";
import cisternaImg from "@assets/generated_images/clean_underground_cistern_interior.webp";
import cisternaImgFallback from "@assets/generated_images/clean_underground_cistern_interior.png";

export default function Services() {
  const services = [
    {
      title: "Lavado de Tinacos en Querétaro",
      description: "Servicio profesional de limpieza y desinfección de tinacos. Eliminamos sedimentos, bacterias, algas y garantizamos agua cristalina para tu familia.",
      features: ["Desinfección profunda con productos certificados", "Revisión de flotador y válvulas", "Duración: 1-2 horas", "Personal capacitado y uniformado"],
      image: tinacoImg,
      imageFallback: tinacoImgFallback,
      alt: "Lavado profesional de tinaco residencial en Querétaro"
    },
    {
      title: "Lavado de Cisternas en Querétaro",
      description: "Limpieza profesional de cisternas con equipo especializado para espacios confinados. Servicio completo con extracción de lodos y desinfección.",
      features: ["Extracción de sedimentos y lodos", "Desinfección de paredes y fondo", "Revisión de bomba y sistema", "Personal certificado", "Duración: 2-3 horas"],
      image: cisternaImg,
      imageFallback: cisternaImgFallback,
      alt: "Servicio de limpieza de cisterna subterránea en Querétaro"
    }
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-muted-foreground text-lg">
            Utilizamos productos biodegradables y técnicas especializadas para garantizar la máxima higiene sin dañar tus instalaciones.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50"
            >
              <div className="relative h-64 overflow-hidden">
                <picture>
                  <source srcSet={service.image} type="image/webp" />
                  <img 
                    src={service.imageFallback} 
                    alt={service.alt} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    width="800"
                    height="600"
                    loading="lazy"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="absolute bottom-4 left-6 text-2xl font-bold text-white font-heading">
                  {service.title}
                </h3>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-muted-foreground mb-6 text-lg">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-foreground font-medium">
                      <CheckCircle2 className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
