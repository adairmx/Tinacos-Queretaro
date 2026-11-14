export const TIPOS_DE_SERVICIO = ["tinaco", "cisterna", "ambos", "otro"] as const;
export type TipoDeServicio = (typeof TIPOS_DE_SERVICIO)[number];

export const NOMBRE_DE_TIPO: Record<TipoDeServicio, string> = {
  tinaco: "Lavado de tinaco",
  cisterna: "Lavado de cisterna",
  ambos: "Tinaco y cisterna",
  otro: "Otro servicio",
};

/** Precios al cliente en pesos, los mismos que publica lavadotinacos.com. "Otro" se cotiza a mano. */
export const PRECIO_BASE: Record<TipoDeServicio, number> = {
  tinaco: 1050,
  cisterna: 1350,
  ambos: 2200,
  otro: 0,
};

/** Parte del precio que le toca a la casa cuando el proveedor no tiene una comisión propia. */
export const COMISION_POR_OMISION = 30;

export const montoDeComision = (precio: number, comisionPct: number) => Math.round((precio * comisionPct) / 100);
