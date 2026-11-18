import { Check, MessageCircle, PhoneCall, Star, Droplets } from "lucide-react";

/**
 * Llamados al servicio dentro del blog. El blog es para visitas y AdSense (Adair, 18 nov 2026: «ahí
 * yo no consigo clientes, ahí solamente son views»), así que son discretos: tarjeta en la portada del
 * blog, tarjeta compacta bajo el índice y un aviso al final del artículo.
 *
 * Los toques a WhatsApp y teléfono los cuenta solo `lib/medicion.ts` (escucha todos los clics del sitio).
 */
export const WHATSAPP = "5214425016667";
export const TELEFONO = "+524425016667";

/** Calificación de la ficha de Google de MonsterCo (vista el 16 nov 2026). */
export const CALIFICACION = { estrellas: "4.9", resenas: 58 };

export const PAQUETES = [
  { clave: "tinaco", nombre: "Lavado de tinaco", precio: 1050, detalle: "Hasta 1,100 litros", destacado: false },
  { clave: "duo", nombre: "Paquete Dúo", precio: 2200, detalle: "Tinaco + cisterna · ahorras $200", destacado: true },
  { clave: "cisterna", nombre: "Lavado de cisterna", precio: 1350, detalle: "Hasta 5,000 litros", destacado: false },
] as const;

export const pesos = (monto: number) => `$${monto.toLocaleString("es-MX")}`;

export function enlaceWhatsApp(texto: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

function mensaje(titulo?: string, paquete?: string) {
  const leido = titulo ? `Hola, leí su artículo "${titulo}"` : "Hola, vi su blog";
  return `${leido} y quiero cotizar ${paquete ? `el ${paquete}` : "el lavado de mi tinaco o cisterna"}.`;
}

function Estrellas({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="flex text-amber-400" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-current" />
        ))}
      </span>
      <span className="font-bold">{CALIFICACION.estrellas}</span>
      <span className="opacity-75">· {CALIFICACION.resenas} reseñas en Google</span>
    </span>
  );
}

function BotonWhatsApp({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 font-bold text-white shadow-md transition hover:bg-[#1ebe5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 ${className}`}
    >
      <MessageCircle className="h-5 w-5 fill-current" />
      {children}
    </a>
  );
}

const GARANTIAS = ["Pagas al terminar, sin anticipo", "Lavado a presión y desinfección", "Técnicos con equipo propio"];

/** Tarjeta del servicio. `compacta` va bajo el índice del artículo, sin robarle espacio a la lectura. */
export function TarjetaServicio({ titulo, compacta = false }: { titulo?: string; compacta?: boolean }) {
  if (compacta) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">¿Lo hacemos por ti?</p>
        <p className="mt-1 font-heading text-base font-bold leading-snug text-slate-900">
          Lavado de tinaco desde {pesos(PAQUETES[0].precio)}
        </p>
        <Estrellas className="mt-2 text-[11px] text-slate-500" />
        <BotonWhatsApp href={enlaceWhatsApp(mensaje(titulo))} className="mt-4 h-10 w-full text-sm">
          Cotizar por WhatsApp
        </BotonWhatsApp>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-lg shadow-primary/5">
      <div className="bg-gradient-to-br from-primary to-[hsl(200_90%_30%)] p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-white/75">¿Lo hacemos por ti?</p>
        <p className="mt-1 font-heading text-xl font-bold leading-snug">Lavado profesional de tinacos y cisternas</p>
        <p className="mt-3 text-sm text-white/80">
          Desde <span className="font-heading text-3xl font-extrabold text-white">{pesos(PAQUETES[0].precio)}</span>
        </p>
      </div>
      <div className="space-y-4 p-5">
        <Estrellas className="text-xs text-slate-600" />
        <ul className="space-y-2 text-sm text-slate-700">
          {GARANTIAS.map((g) => (
            <li key={g} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              {g}
            </li>
          ))}
        </ul>
        <BotonWhatsApp href={enlaceWhatsApp(mensaje(titulo))} className="h-12 w-full text-base">
          Cotizar por WhatsApp
        </BotonWhatsApp>
        <a
          href={`tel:${TELEFONO}`}
          className="flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <PhoneCall className="h-4 w-4" /> 442 501 6667
        </a>
      </div>
    </div>
  );
}

/** Aviso a media lectura: corto, para no romper el artículo. */
export function AvisoEnArticulo({ titulo }: { titulo?: string }) {
  return (
    <aside className="not-prose my-10 flex flex-col gap-4 rounded-2xl border border-accent/30 bg-gradient-to-r from-amber-50 to-orange-50 p-5 sm:flex-row sm:items-center sm:p-6">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
        <Droplets className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <p className="font-heading text-lg font-bold leading-snug text-slate-900">
          ¿Lodo, sarro o agua turbia? Nosotros lo dejamos limpio.
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Vaciado, lavado a presión y desinfección desde {pesos(PAQUETES[0].precio)}. Pagas al terminar.
        </p>
      </div>
      <BotonWhatsApp href={enlaceWhatsApp(mensaje(titulo))} className="h-11 flex-shrink-0 text-sm">
        Cotizar
      </BotonWhatsApp>
    </aside>
  );
}


