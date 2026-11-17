import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { notaDePrecio, TERMINOS_PATH } from "@shared/terminos";

export default function Pricing() {
  const plans = [
    {
      name: "Lavado de Tinaco",
      price: "$1,050",
      description: "Para tinacos residenciales de hasta 1,100 litros",
      features: [
        "Vaciado y retiro de sedimentos y lodos",
        "Lavado y tallado a presión",
        "Desinfección con grado bactericida",
        "Revisión de flotador, tapa y pichancha",
        "Técnicos certificados con equipo propio"
      ],
      highlight: false
    },
    {
      name: "Paquete Dúo (Tinaco + Cisterna)",
      price: "$2,200",
      description: "Tinaco (1,100L) + Cisterna (hasta 5,000L)",
      features: [
        "Ahorro de $200 en contratación conjunta",
        "Lavado profundo integral de ambos depósitos",
        "Desinfección profunda grado alimenticio",
        "Revisión del sistema de bombeo e hidroneumático",
        "Garantía de satisfacción y servicio certificado"
      ],
      highlight: true
    },
    {
      name: "Lavado de Cisterna",
      price: "$1,350",
      description: "Para cisternas y aljibes de hasta 5,000 litros",
      features: [
        "Extracción con bomba sumergible de achique",
        "Lavado profundo de piso, paredes y techo",
        "Desinfección antibacteriana profunda",
        "Revisión de válvula pichancha y sellado",
        "Garantía de agua cristalina y segura"
      ],
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
            Precios Transparentes
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sin sorpresas. Ofrecemos precios competitivos para mantener tu agua limpia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative rounded-2xl p-8 border ${
                plan.highlight 
                  ? "bg-white shadow-2xl border-accent/50 scale-105 z-10" 
                  : "bg-muted/10 shadow-lg border-border hover:border-primary/30 transition-colors"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                  Más Popular
                </div>
              )}
              
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">{plan.name}</h3>
              <div className="text-3xl font-extrabold text-primary mb-2">{plan.price}</div>
              <p className="text-muted-foreground mb-6 text-sm">{plan.description}</p>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-foreground/80 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full font-bold ${
                  plan.highlight 
                    ? "bg-accent hover:bg-accent/90 text-white" 
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
                asChild
              >
                <a 
                  href={`https://wa.me/5214425016667?text=Hola,%20me%20interesa%20el%20paquete%20${plan.name}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Agendar Cita
                </a>
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p className="font-medium text-foreground">💡 Precios fijos transparentes para servicio residencial estándar.</p>
          <p className="mt-1">Para capacidades industriales, aljibes mayores a 10,000L o edificios comerciales, cotizamos de inmediato a tu medida.</p>
          <p className="mt-3 text-xs">
            {notaDePrecio("queretaro")}{" "}
            <a href={TERMINOS_PATH} className="underline hover:text-foreground">
              Términos y condiciones
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
