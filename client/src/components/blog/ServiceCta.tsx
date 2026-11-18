import { Check, MessageCircle, PhoneCall, ShieldCheck, Star, Sparkles, Droplets } from "lucide-react";

/**
 * Llamados a contratar que viven dentro del blog. El blog trae casi todas las visitas del sitio,
 * así que cada artículo tiene que dejar a la mano el servicio: tarjeta lateral, aviso a media lectura,
 * paquetes al final y barra fija en celular.
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

/** Tarjeta fija en la columna lateral del artículo (escritorio). */
export function TarjetaServicio({ titulo }: { titulo?: string }) {
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

/** Paquetes al final del artículo o del blog. */
export function Paquetes({ titulo, encabezado = "Deja tu agua limpia sin subir a la azotea" }: { titulo?: string; encabezado?: string }) {
  return (
    <section className="not-prose relative overflow-hidden rounded-3xl bg-slate-900 px-5 py-10 text-white sm:px-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/80">
          <ShieldCheck className="h-3.5 w-3.5" /> Servicio a domicilio
        </span>
        <h2 className="mt-4 font-heading text-2xl font-extrabold leading-tight sm:text-3xl">{encabezado}</h2>
        <Estrellas className="mt-3 justify-center text-sm text-white" />
      </div>
      <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
        {PAQUETES.map((p) => (
          <div
            key={p.clave}
            className={`flex flex-col rounded-2xl p-5 ${
              p.destacado ? "bg-white text-slate-900 shadow-xl ring-2 ring-accent sm:-translate-y-2" : "bg-white/5 ring-1 ring-white/15"
            }`}
          >
            {p.destacado && (
              <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                <Sparkles className="h-3 w-3" /> Más pedido
              </span>
            )}
            <p className={`text-sm font-semibold ${p.destacado ? "text-slate-600" : "text-white/70"}`}>{p.nombre}</p>
            <p className="mt-1 font-heading text-3xl font-extrabold">{pesos(p.precio)}</p>
            <p className={`mt-1 text-xs ${p.destacado ? "text-slate-500" : "text-white/60"}`}>{p.detalle}</p>
            <BotonWhatsApp href={enlaceWhatsApp(mensaje(titulo, p.nombre.toLowerCase()))} className="mt-5 h-11 text-sm">
              Agendar
            </BotonWhatsApp>
          </div>
        ))}
      </div>
      <p className="relative mt-6 text-center text-xs text-white/60">
        Precios para casa habitación dentro de 15 km del centro de la ciudad.{" "}
        <a href="/terminos" className="underline hover:text-white">
          Términos
        </a>
      </p>
    </section>
  );
}

/** Barra fija abajo en celular. Deja espacio con `pb-24` en la página. */
export function BarraCelular({ titulo }: { titulo?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-white/95 px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-bold text-slate-900">¿Lo lavamos por ti?</p>
        <p className="text-xs text-slate-500">Desde {pesos(PAQUETES[0].precio)} · pagas al terminar</p>
      </div>
      <a
        href={`tel:${TELEFONO}`}
        aria-label="Llamar"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-primary text-primary"
      >
        <PhoneCall className="h-5 w-5" />
      </a>
      <BotonWhatsApp href={enlaceWhatsApp(mensaje(titulo))} className="h-11 flex-shrink-0 text-sm">
        WhatsApp
      </BotonWhatsApp>
    </div>
  );
}
