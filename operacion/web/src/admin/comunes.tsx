import { CIUDADES, ciudadPorSlug } from "../../../shared/ciudades.ts";
import type { EstadoDeServicio } from "../../../shared/tipos.ts";
import { Etiqueta } from "../ui.tsx";

export const nombreDeCiudad = (slug: string) => ciudadPorSlug(slug)?.nombre ?? slug;

export const horaLocal = (iso: string) => new Date(iso).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });

/** Cómo se lee en la bitácora cada cosa que le pasó a un servicio. */
export const NOMBRE_DE_EVENTO: Record<string, string> = {
  agendado: "Agendado",
  tomado: "Tomado",
  en_camino: "En camino",
  realizado: "Terminado",
  cancelado: "Cancelado",
  soltado: "Vuelto a ofrecer",
  sin_proveedor: "Sin proveedor",
  liquidacion_reportada: "Transferencia reportada",
  liquidacion_pagada: "Comisión cobrada",
};

export const quienFue = (actor: string) =>
  actor === "admin" ? "Administración" : actor === "sistema" ? "Sistema" : actor.replace(/^proveedor:/, "Proveedor #");

export function haceCuanto(iso: string) {
  const minutos = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} min`;
  if (minutos < 1440) return `hace ${Math.floor(minutos / 60)} h`;
  return `hace ${Math.floor(minutos / 1440)} d`;
}

const ESTADOS: Record<EstadoDeServicio, { color: "ambar" | "azul" | "verde" | "rojo"; texto: string }> = {
  agendado: { color: "ambar", texto: "Sin proveedor" },
  tomado: { color: "azul", texto: "Tomado" },
  en_camino: { color: "azul", texto: "En camino" },
  realizado: { color: "verde", texto: "Realizado" },
  cancelado: { color: "rojo", texto: "Cancelado" },
};

export function EtiquetaDeEstado({ estado }: { estado: EstadoDeServicio }) {
  const { color, texto } = ESTADOS[estado];
  return <Etiqueta color={color}>{texto}</Etiqueta>;
}

/** Ciudades como pastillas de selección múltiple. */
export function SelectorDeCiudades({ valor, alCambiar }: { valor: string[]; alCambiar: (nuevas: string[]) => void }) {
  const alternar = (slug: string) => alCambiar(valor.includes(slug) ? valor.filter((s) => s !== slug) : [...valor, slug]);
  return (
    <div className="flex flex-wrap gap-2">
      {CIUDADES.map((ciudad) => {
        const activa = valor.includes(ciudad.slug);
        return (
          <button
            key={ciudad.slug}
            type="button"
            aria-pressed={activa}
            onClick={() => alternar(ciudad.slug)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${activa ? "border-marca bg-marca text-white" : "border-linea bg-white text-tinta hover:bg-fondo"}`}
          >
            {ciudad.nombre}
          </button>
        );
      })}
    </div>
  );
}
