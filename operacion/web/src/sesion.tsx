import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ErrorDeApi, type Yo } from "./api.ts";

interface Sesion {
  /** undefined mientras se averigua; null si no hay sesión. */
  yo: Yo | null | undefined;
  recargar: () => Promise<void>;
  salir: () => Promise<void>;
}

const Contexto = createContext<Sesion>({ yo: undefined, recargar: async () => undefined, salir: async () => undefined });

export function ProveedorDeSesion({ children }: { children: ReactNode }) {
  const [yo, setYo] = useState<Yo | null>();

  const recargar = useCallback(async () => {
    try {
      setYo(await api.yo());
    } catch (error) {
      // Sin conexión no se concluye que la sesión se perdió: se deja lo que había.
      if (error instanceof ErrorDeApi && error.status === 401) setYo(null);
      else setYo((actual) => actual ?? null);
    }
  }, []);

  const salir = useCallback(async () => {
    await api.salir().catch(() => undefined);
    setYo(null);
  }, []);

  useEffect(() => void recargar(), [recargar]);

  return <Contexto.Provider value={{ yo, recargar, salir }}>{children}</Contexto.Provider>;
}

export const useSesion = () => useContext(Contexto);
