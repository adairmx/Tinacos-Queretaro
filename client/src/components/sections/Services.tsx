import { CheckCircle2 } from "lucide-react";
import tinacoImg from "@assets/generated_images/modern_residential_water_tank_on_roof.png";
import cisternaImg from "@assets/generated_images/clean_underground_cistern_interior.png";

export default function Services() {
  const services = [
    {
      title: "Lavado de Tinacos",
      description: "Eliminamos sedimentos, bacterias y algas de tu tinaco para asegurar la calidad del agua en tu hogar.",
      features: ["Desinfección profunda", "Revisión de flotador", "Sin desperdiciar agua", "Duración: 1-2 horas", "Personal capacitado"],
      image: tinacoImg,
      alt: "Lavado de tinaco residencial"
    },
    {
      title: "Lavado de Cisternas",
      description: "Limpieza profesional de cisternas con equipo especializado para espacios confinados.",
      features: ["Extracción de sedimentos", "Desinfección de paredes", "Revisión de bomba", "Personal capacitado", "Duración: 1-2 horas"],
      image: cisternaImg,
      alt: "Lavado de cisterna subterránea"
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
                <img 
                  src={service.image} 
                  alt={service.alt} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
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
