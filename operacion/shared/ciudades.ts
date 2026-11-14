export interface Ciudad {
  slug: string;
  nombre: string;
  /** Zona horaria IANA: de ella sale qué día es "hoy" para agendar. */
  zona: string;
}

export const CIUDADES: Ciudad[] = [
  { slug: "queretaro", nombre: "Querétaro", zona: "America/Mexico_City" },
  { slug: "cdmx", nombre: "Ciudad de México", zona: "America/Mexico_City" },
  { slug: "edomex", nombre: "Estado de México", zona: "America/Mexico_City" },
  { slug: "guadalajara", nombre: "Guadalajara y Zapopan", zona: "America/Mexico_City" },
  { slug: "monterrey", nombre: "Monterrey", zona: "America/Monterrey" },
  { slug: "puebla", nombre: "Puebla y Cholula", zona: "America/Mexico_City" },
  { slug: "toluca", nombre: "Toluca y Metepec", zona: "America/Mexico_City" },
  { slug: "cuernavaca", nombre: "Cuernavaca", zona: "America/Mexico_City" },
  { slug: "leon", nombre: "León", zona: "America/Mexico_City" },
  { slug: "merida", nombre: "Mérida", zona: "America/Merida" },
  { slug: "san-luis-potosi", nombre: "San Luis Potosí", zona: "America/Mexico_City" },
  { slug: "aguascalientes", nombre: "Aguascalientes", zona: "America/Mexico_City" },
  { slug: "cancun", nombre: "Cancún", zona: "America/Cancun" },
];

export const ciudadPorSlug = (slug: string) => CIUDADES.find((c) => c.slug === slug);
