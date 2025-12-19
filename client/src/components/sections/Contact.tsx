import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Clock, MessageCircle } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-6">
              Contáctanos
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              ¿Listo para tener agua limpia? Escríbenos para cotizar o agendar tu servicio. 
              Respondemos rápidamente.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white p-3 rounded-lg shadow-sm text-accent">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Teléfono / WhatsApp</h3>
                  <a href="tel:+5214425016667" className="text-muted-foreground hover:text-primary transition-colors">
                    442 501 6667
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-white p-3 rounded-lg shadow-sm text-accent">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Correo Electrónico</h3>
                  <a href="mailto:contacto@lavadoqro.com" className="text-muted-foreground hover:text-primary transition-colors">
                    contacto@lavadoqro.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white p-3 rounded-lg shadow-sm text-accent">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Horario de Servicio</h3>
                  <p className="text-muted-foreground">
                    Lunes a Sábado: 8:00 AM - 6:00 PM<br/>
                    Domingo: Previa Cita
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-white rounded-xl shadow-sm border border-border/50">
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                Respuesta Inmediata
              </h4>
              <p className="text-muted-foreground text-sm">
                La forma más rápida de contactarnos es vía WhatsApp. Te enviaremos una cotización en minutos.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-border/50">
            <h3 className="text-2xl font-bold font-heading mb-6">Envíanos un mensaje</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nombre</label>
                  <Input id="name" placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Teléfono</label>
                  <Input id="phone" placeholder="442..." />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="service" className="text-sm font-medium">Servicio de interés</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option>Lavado de Tinaco</option>
                  <option>Lavado de Cisterna</option>
                  <option>Ambos (Paquete)</option>
                  <option>Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Mensaje</label>
                <Textarea id="message" placeholder="¿De qué tamaño es tu tinaco/cisterna? ¿En qué zona te ubicas?" rows={4} />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 text-lg">
                Enviar Mensaje
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
