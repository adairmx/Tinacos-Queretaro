/**
 * Reglas de cobertura que se citan en los términos del servicio y junto a los precios.
 * Adair (16 nov 2026): los precios publicados valen hasta 15 km del punto cero, que es el centro de cada ciudad;
 * más lejos la tarifa se recalcula y se da el total al hablar con el cliente.
 */
export const RADIO_KM = 15;

export const TERMINOS_PATH = "/terminos";

/** Punto cero de cada ciudad, desde donde se miden los kilómetros. La clave es el slug de la ciudad. */
export const PUNTO_CERO: Record<string, { ciudad: string; punto: string }> = {
  queretaro: { ciudad: "Querétaro", punto: "Jardín Zenea, Centro Histórico" },
  cdmx: { ciudad: "Ciudad de México", punto: "Zócalo (Plaza de la Constitución)" },
  edomex: { ciudad: "Estado de México (zona conurbada)", punto: "Torres de Satélite, Naucalpan" },
  guadalajara: { ciudad: "Guadalajara y Zapopan", punto: "Catedral de Guadalajara" },
  monterrey: { ciudad: "Monterrey", punto: "Macroplaza" },
  puebla: { ciudad: "Puebla y Cholula", punto: "Zócalo de Puebla" },
  toluca: { ciudad: "Toluca y Metepec", punto: "Plaza de los Mártires, Toluca" },
  cuernavaca: { ciudad: "Cuernavaca", punto: "Palacio de Cortés" },
  leon: { ciudad: "León", punto: "Plaza Principal (Plaza de los Fundadores)" },
  merida: { ciudad: "Mérida", punto: "Plaza Grande" },
  "san-luis-potosi": { ciudad: "San Luis Potosí", punto: "Plaza de Armas" },
  aguascalientes: { ciudad: "Aguascalientes", punto: "Plaza de la Patria" },
  cancun: { ciudad: "Cancún", punto: "Palacio Municipal de Benito Juárez (Av. Tulum)" },
};

/** Nota corta que va debajo de los precios. */
export const notaDePrecio = (slug = "queretaro") => {
  const punto = PUNTO_CERO[slug]?.punto;
  return `Precios para casa habitación dentro de ${RADIO_KM} km del centro de la ciudad${punto ? ` (${punto})` : ""}. Más lejos, la tarifa se recalcula y te damos el total antes de agendar.`;
};
