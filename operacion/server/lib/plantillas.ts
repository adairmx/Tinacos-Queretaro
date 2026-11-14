/**
 * Plantillas de WhatsApp. Fuera de las 24 horas de la última respuesta de la persona, WhatsApp sólo deja mandar
 * mensajes con una plantilla que Meta haya aprobado, así que cada aviso del sistema sale de una de éstas.
 *
 * El texto de aquí tiene que ser idéntico al que se registra en Meta (`npm run plantillas`). Reglas de Meta que
 * estos textos respetan: no empiezan ni terminan con una variable, y las variables van numeradas en orden.
 */
export interface Plantilla {
  /** Nombre con el que se registra en Meta. */
  nombre: string;
  /** UTILITY: avisos de un servicio ya contratado. MARKETING: invitaciones; Meta las cobra y limita distinto. */
  categoria: "UTILITY" | "MARKETING";
  cuerpo: string;
  /** Un valor de muestra por variable; Meta lo pide para revisar la plantilla. */
  ejemplo: string[];
}

export const IDIOMA = "es_MX";

export const PLANTILLAS = {
  servicio_nuevo: {
    nombre: "servicio_nuevo",
    categoria: "UTILITY",
    cuerpo: "Servicio nuevo: {{1}} Precio al cliente: {{2}}. Tómalo desde tu cuenta en {{3}} antes de que otro proveedor se lo quede.",
    ejemplo: ["Lavado de tinaco de 1,100 L en Querétaro, Juriquilla. dom 15 nov, 8 a.m. – 10 a.m.", "$1,050", "https://ejemplo.com/proveedor"],
  },
  servicio_cancelado: {
    nombre: "servicio_cancelado",
    categoria: "UTILITY",
    cuerpo: "Se canceló este servicio: {{1}} Ya no hay que ir. Gracias por tu disponibilidad.",
    ejemplo: ["Lavado de tinaco en Querétaro, Juriquilla. dom 15 nov, 8 a.m. – 10 a.m."],
  },
  en_camino: {
    nombre: "tecnico_en_camino",
    categoria: "UTILITY",
    cuerpo: "Hola {{1}}, le escribimos de MonsterCo Lavado de Tinacos. El técnico ya va en camino a su domicilio y estará llegando en la próxima hora.",
    ejemplo: ["Laura"],
  },
  confirmacion_noche: {
    nombre: "confirmacion_vispera",
    categoria: "UTILITY",
    cuerpo: "Hola {{1}}, le escribimos de MonsterCo Lavado de Tinacos. Le recordamos su {{2}} de {{3}} ¿Nos confirma que habrá alguien en el domicilio?",
    ejemplo: ["Laura", "lavado de tinaco", "mañana entre 10:00 a.m. y 12:00 p.m. (hora aproximada)."],
  },
  confirmacion_manana: {
    nombre: "confirmacion_del_dia",
    categoria: "UTILITY",
    cuerpo: "Buenos días {{1}}, le escribimos de MonsterCo Lavado de Tinacos. Su {{2}} es {{3}} Le avisamos en cuanto el técnico vaya en camino.",
    ejemplo: ["Laura", "lavado de tinaco", "hoy a las 8:00 a.m."],
  },
  recordatorio_6_meses: {
    nombre: "recordatorio_semestral",
    categoria: "MARKETING",
    cuerpo: "Hola {{1}}, le escribimos de MonsterCo Lavado de Tinacos. Hace seis meses hicimos su {{2}} y ya toca el siguiente para mantener el agua limpia. ¿Le agendamos esta semana?",
    ejemplo: ["Laura", "lavado de tinaco"],
  },
  /** Lo que el sistema le avisa a la casa: servicio sin proveedor, proveedor nuevo, respuesta de un cliente. */
  aviso_interno: {
    nombre: "aviso_interno",
    categoria: "UTILITY",
    cuerpo: "Aviso de operación de MonsterCo: {{1}} Revísalo en el panel.",
    ejemplo: ["Nadie ha tomado el servicio #12 de mañana a las 8:00 a.m."],
  },
} satisfies Record<string, Plantilla>;

export type NombreDePlantilla = keyof typeof PLANTILLAS;

/** WhatsApp rechaza valores con saltos de línea, tabuladores o varios espacios seguidos. */
export const limpiarVariable = (valor: string) => valor.replace(/\s+/g, " ").trim();

/** El mensaje tal como lo va a leer la persona. */
export function redactar(plantilla: NombreDePlantilla, variables: string[]) {
  return PLANTILLAS[plantilla].cuerpo.replace(/\{\{(\d+)\}\}/g, (_, numero) => variables[Number(numero) - 1] ?? "");
}

export const variablesDe = (plantilla: NombreDePlantilla) => (PLANTILLAS[plantilla].cuerpo.match(/\{\{\d+\}\}/g) ?? []).length;
