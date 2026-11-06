import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import MobileActionFooter from "@/components/sections/MobileActionFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  Wrench, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  Sparkles
} from "lucide-react";

const providerFormSchema = z.object({
  name: z.string().min(3, "Ingresa tu nombre completo"),
  phone: z.string().min(10, "Ingresa un número de teléfono a 10 dígitos"),
  city: z.string().min(2, "Ingresa tu ciudad"),
  state: z.string().min(2, "Ingresa tu estado"),
  coverageAreas: z.string().min(3, "Indica qué colonias o municipios cubres"),
  experienceYears: z.coerce.number().min(0, "Años de experiencia válidos"),
  hasOwnEquipment: z.coerce.number(),
  notes: z.string().optional(),
});

type ProviderFormData = z.infer<typeof providerFormSchema>;

export default function JoinNetwork() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      hasOwnEquipment: 1,
      experienceYears: 2,
    },
  });

  const onSubmit = async (data: ProviderFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          status: "prospecto",
          commissionAgreedPct: 30,
        }),
      });

      if (!res.ok) throw new Error("Error al enviar solicitud");

      setSubmitted(true);
      toast({
        title: "¡Solicitud recibida con éxito!",
        description: "Nuestro equipo se pondrá en contacto contigo por WhatsApp en breve.",
      });
      reset();
    } catch {
      toast({
        title: "Hubo un inconveniente",
        description: "Por favor intenta de nuevo o mándanos un WhatsApp directo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 pb-20 md:pb-12">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 via-background to-background py-16 md:py-24 border-b border-border/40">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Red Nacional de Técnicos y Cuadrillas</span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl font-black text-foreground tracking-tight mb-6 leading-tight">
              Gana más clientes en tu ciudad <br className="hidden md:block" />
              <span className="text-primary">sin gastar un solo peso en publicidad</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
              Recibe órdenes de trabajo ya cotizadas y confirmadas de clientes listos para limpiar su tinaco o cisterna en tu zona. Tú pones la mano de obra, nosotros ponemos los clientes diarios.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-foreground/80">
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border shadow-xs">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Trabajos en tu zona</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border shadow-xs">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Cobro directo con el cliente</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border shadow-xs">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Libertad de aceptar u omitir servicios</span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-center font-heading text-3xl font-bold mb-12">
              ¿Por qué afiliarte a nuestra red?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-start">
                <div className="p-3 bg-primary/10 rounded-xl text-primary mb-4">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Ingresos Altos y Seguros</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Te llevas la mayor parte del servicio: <strong>$750 netos</strong> por tinaco, <strong>$950 netos</strong> por cisterna y <strong>$1,500 netos</strong> por paquete dúo. Haces 2 servicios diarios y te llevas hasta $1,800 libres.
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-start">
                <div className="p-3 bg-accent/10 rounded-xl text-accent mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Cero Tiempo en Vender</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Olvídate de contestar prospectos curiosos que no compran. Te mandamos la orden por WhatsApp lista para agendar: nombre, colonia, tipo de depósito y hora.
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-start">
                <div className="p-3 bg-green-500/10 rounded-xl text-green-600 mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Reputación y Respaldo</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Nuestra plataforma respalda la confianza del cliente. Entre más servicios bien evaluados realices, más servicios prioritarios te asignaremos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="font-heading text-3xl font-bold mb-2">
                  Regístrate como Profesional Aliado
                </h2>
                <p className="text-muted-foreground">
                  Completa tus datos y nos comunicaremos contigo hoy mismo por WhatsApp para activar tu cuenta.
                </p>
              </div>

              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">¡Solicitud Enviada con Éxito!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Hemos registrado tus datos. Nuestro equipo revisará tu zona de cobertura y te escribirá por WhatsApp para asignarte los primeros servicios disponibles.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-4">
                    Enviar otro registro
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nombre completo o Nombre del Negocio *</label>
                      <Input
                        placeholder="Ej. Juan Pérez / Plomería Rápida"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Teléfono con WhatsApp *</label>
                      <Input
                        placeholder="Ej. 442 123 4567"
                        type="tel"
                        {...register("phone")}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Ciudad principal *</label>
                      <Input
                        placeholder="Ej. Querétaro, CDMX, Guadalajara"
                        {...register("city")}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Estado *</label>
                      <Input
                        placeholder="Ej. Querétaro, Jalisco, CDMX"
                        {...register("state")}
                      />
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Zonas o municipios que cubres *</label>
                    <Input
                      placeholder="Ej. Juriquilla, El Refugio, Zibatá, Corregidora, Centro"
                      {...register("coverageAreas")}
                    />
                    {errors.coverageAreas && (
                      <p className="text-red-500 text-xs mt-1">{errors.coverageAreas.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Años de experiencia</label>
                      <Input
                        type="number"
                        min="0"
                        {...register("experienceYears")}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">¿Tienes equipo propio? (Hidrolavadora / bomba)</label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...register("hasOwnEquipment")}
                      >
                        <option value={1}>Sí, cuento con equipo completo</option>
                        <option value={0}>No, solo herramienta básica de plomería</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Notas adicionales o dudas (Opcional)</label>
                    <Textarea
                      placeholder="Cuéntanos si trabajas solo o tienes cuadrilla, tus días disponibles, etc."
                      {...register("notes")}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full font-bold text-lg h-12 bg-primary hover:bg-primary/90 text-white"
                  >
                    {isSubmitting ? "Enviando registro..." : "Enviar Solicitud para Afiliarme"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Al registrarte aceptas recibir comunicaciones y oportunidades de servicio de nuestra red. Respetamos tu privacidad y no compartimos tus datos con terceros.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileActionFooter />
    </div>
  );
}

