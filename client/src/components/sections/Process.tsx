import { ClipboardCheck, ShieldCheck, Sparkles, Waves, type LucideIcon } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Waves,
    title: "Vaciamos y sacamos el lodo",
    text: "Con bomba de achique extraemos los sedimentos hacia afuera, nunca por las tuberías de tu casa.",
  },
  {
    icon: Sparkles,
    title: "Lavamos a presión",
    text: "Hidrolavadora y cepillado en paredes, losa y piso para retirar sarro, lama y biopelícula.",
  },
  {
    icon: ShieldCheck,
    title: "Desinfectamos",
    text: "Aplicamos desinfectante bactericida de grado sanitario en toda la superficie interior.",
  },
  {
    icon: ClipboardCheck,
    title: "Revisamos y sellamos",
    text: "Enjuagamos, verificamos válvulas y dejamos la tapa bien cerrada antes de irnos.",
  },
];

export default function Process() {
  return (
    <section id="proceso" className="py-16 md:py-24 bg-background scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <span className="text-accent font-bold uppercase tracking-widest text-xs">Nuestro proceso</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3">
            Así dejamos limpio tu depósito
          </h2>
        </div>

        <ol className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div
            className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-accent/50"
            aria-hidden="true"
          />
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="relative flex lg:flex-col items-start lg:items-center gap-4 lg:text-center">
              <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold text-accent mb-1">Paso {index + 1}</p>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
