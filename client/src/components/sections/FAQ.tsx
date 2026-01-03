import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect } from "react";

export default function FAQ() {
  const faqs = [
    {
      question: "¿Con qué frecuencia debo lavar mi tinaco?",
      answer: "Se recomienda lavar y desinfectar tu tinaco cada 6 meses para garantizar la calidad del agua. En zonas con mucho polvo o sedimentos, puede ser necesario hacerlo cada 3-4 meses."
    },
    {
      question: "¿Cuánto tiempo tarda el lavado de un tinaco?",
      answer: "El servicio de lavado de tinaco generalmente toma entre 1 a 2 horas, dependiendo del tamaño y nivel de suciedad. Incluye vaciado, limpieza profunda, desinfección y llenado."
    },
    {
      question: "¿Qué productos utilizan para la desinfección?",
      answer: "Utilizamos productos biodegradables aprobados por la COFEPRIS y cloro en concentraciones seguras. Todos nuestros productos están certificados para uso en sistemas de agua potable."
    },
    {
      question: "¿Atienden en toda la zona de Querétaro?",
      answer: "Sí, damos servicio en toda la zona metropolitana de Querétaro, incluyendo Juriquilla, El Refugio, Corregidora, El Marqués y zonas aledañas."
    },
    {
      question: "¿Necesito estar presente durante el servicio?",
      answer: "Es recomendable que alguien esté presente para dar acceso al tinaco o cisterna, y para verificar el trabajo realizado. El proceso es rápido y te mostraremos el antes y después."
    },
    {
      question: "¿Qué diferencia hay entre lavar un tinaco y una cisterna?",
      answer: "El tinaco está ubicado en altura (generalmente en azotea) y suele ser más pequeño. La cisterna está bajo tierra y es más grande. Ambos requieren limpieza profesional, pero la cisterna necesita equipo especializado para espacios confinados."
    },
    {
      question: "¿Ofrecen garantía en el servicio?",
      answer: "Sí, garantizamos nuestro trabajo. Si detectas algún problema después del servicio, lo revisamos sin costo adicional. También te damos recomendaciones para mantener el agua limpia por más tiempo."
    },
    {
      question: "¿Cómo puedo agendar una cita?",
      answer: "Puedes contactarnos directamente por WhatsApp al 442-501-6667. Te responderemos rápidamente para agendar tu cita en el día y horario que mejor te convenga."
    }
  ];

  useEffect(() => {
    // Add FAQ Schema to head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
    document.head.appendChild(script);

    return () => {
      // Safe cleanup - only remove if script still exists
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []); // Empty array is correct as faqs is static

  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Resolvemos tus dudas sobre el lavado de tinacos y cisternas en Querétaro
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
