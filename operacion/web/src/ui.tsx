import { useCallback, useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { ErrorDeApi } from "./api.ts";

export const pesos = (monto: number) => `$${monto.toLocaleString("es-MX")}`;

export const mensajeDe = (error: unknown) => (error instanceof ErrorDeApi ? error.message : "Algo falló. Intenta de nuevo.");

const TONOS = {
  primario: "bg-marca text-white hover:bg-marca-fuerte",
  acento: "bg-acento text-white hover:brightness-95",
  claro: "bg-white text-tinta border border-linea hover:bg-fondo",
  peligro: "bg-white text-red-700 border border-red-200 hover:bg-red-50",
};

interface PropsDeBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  tono?: keyof typeof TONOS;
  ancho?: boolean;
  chico?: boolean;
}

export function Boton({ tono = "primario", ancho, chico, className = "", type = "button", ...resto }: PropsDeBoton) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:pointer-events-none disabled:opacity-50 ${chico ? "px-3 py-1.5 text-sm" : "px-4 py-3 text-base"} ${ancho ? "w-full" : ""} ${TONOS[tono]} ${className}`}
      {...resto}
    />
  );
}

/** Enlace con aspecto de botón, para abrir WhatsApp o marcar un teléfono. */
export function EnlaceBoton({ href, children, tono = "claro", chico }: { href: string; children: ReactNode; tono?: keyof typeof TONOS; chico?: boolean }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition ${chico ? "px-3 py-1.5 text-sm" : "px-4 py-3 text-base"} ${TONOS[tono]}`}
    >
      {children}
    </a>
  );
}

export function Tarjeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-linea bg-white p-4 shadow-sm ${className}`}>{children}</section>;
}

export function Campo({ etiqueta, ayuda, children }: { etiqueta: string; ayuda?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-tinta">{etiqueta}</span>
      {children}
      {ayuda && <span className="mt-1 block text-xs text-tenue">{ayuda}</span>}
    </label>
  );
}

export const CLASE_DE_ENTRADA =
  "w-full rounded-xl border border-linea bg-white px-3 py-2.5 text-base text-tinta outline-none focus:border-marca focus:ring-2 focus:ring-marca/20";

export const Entrada = (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={`${CLASE_DE_ENTRADA} ${props.className ?? ""}`} />;

const COLORES = {
  gris: "bg-slate-100 text-slate-700",
  azul: "bg-marca-suave text-marca-fuerte",
  verde: "bg-emerald-100 text-emerald-800",
  ambar: "bg-amber-100 text-amber-800",
  rojo: "bg-red-100 text-red-700",
};

export function Etiqueta({ color = "gris", children }: { color?: keyof typeof COLORES; children: ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${COLORES[color]}`}>{children}</span>;
}

export function Mensaje({ tipo = "error", children }: { tipo?: "error" | "bien" | "nota"; children: ReactNode }) {
  const clase = {
    error: "border-red-200 bg-red-50 text-red-800",
    bien: "border-emerald-200 bg-emerald-50 text-emerald-800",
    nota: "border-amber-200 bg-amber-50 text-amber-900",
  }[tipo];
  return (
    <p role={tipo === "error" ? "alert" : "status"} className={`rounded-xl border px-3 py-2 text-sm ${clase}`}>
      {children}
    </p>
  );
}

export const Cargando = () => <p className="py-10 text-center text-tenue">Cargando…</p>;

export const Vacio = ({ children }: { children: ReactNode }) => (
  <p className="rounded-2xl border border-dashed border-linea px-4 py-8 text-center text-tenue">{children}</p>
);

/**
 * Trae datos del servidor y los vuelve a traer cuando se le pide. `cada` los refresca solos cada tantos
 * segundos mientras la pestaña esté a la vista.
 */
export function useDatos<T>(traer: () => Promise<T>, cada?: number) {
  const [datos, setDatos] = useState<T>();
  const [error, setError] = useState<string>();

  // `traer` se toma como estaba al montar: quien necesite otros parámetros vuelve a montar con `key`.
  const recargar = useCallback(async () => {
    try {
      setDatos(await traer());
      setError(undefined);
    } catch (fallo) {
      setError(mensajeDe(fallo));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void recargar();
    if (!cada) return;
    const reloj = setInterval(() => document.visibilityState === "visible" && void recargar(), cada * 1000);
    return () => clearInterval(reloj);
  }, [recargar, cada]);

  return { datos, error, recargar };
}

/** Corre una acción del usuario: avisa mientras está en curso y guarda el error si lo hubo. */
export function useAccion() {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string>();

  const correr = useCallback(async (accion: () => Promise<unknown>) => {
    setOcupado(true);
    setError(undefined);
    try {
      await accion();
      return true;
    } catch (fallo) {
      setError(mensajeDe(fallo));
      return false;
    } finally {
      setOcupado(false);
    }
  }, []);

  return { ocupado, error, correr, limpiar: () => setError(undefined) };
}
