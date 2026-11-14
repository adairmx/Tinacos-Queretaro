import { GUION } from "./guion.ts";
import { herramientasDelAgente, type Contexto, type Herramienta, type LlamadaDeHerramienta } from "./herramientas.ts";

export interface Turno {
  /** humano: lo escribió alguien de la casa; para el modelo cuenta como respuesta nuestra. */
  rol: "cliente" | "agente" | "humano";
  texto: string;
}

/**
 * Quien piensa las respuestas. En producción es Claude (`claude.ts`); en las pruebas, un doble que sigue un libreto.
 * Se encarga de todo el ir y venir con las herramientas y regresa lo que hay que decirle a la persona.
 */
export interface Modelo {
  correr(peticion: { sistema: string; mensajes: { role: "user" | "assistant"; content: string }[]; herramientas: Herramienta[] }): Promise<{
    texto: string;
    /** El modelo se negó a contestar. */
    rechazo: boolean;
  }>;
}

export interface Respuesta {
  texto: string;
  herramientas: LlamadaDeHerramienta[];
  /** La plática se le pasó a una persona: el agente ya no debe seguir contestando. */
  pasoAHumano: boolean;
}

const DESPEDIDA = "Permítame un momento, por favor. En seguida le atiende una persona de nuestro equipo.";

/** Lo que el agente le contesta a la persona, dado lo que se ha dicho hasta ahora en la plática. */
export async function responder(modelo: Modelo, historial: Turno[], contexto: Contexto): Promise<Respuesta> {
  const llamadas: LlamadaDeHerramienta[] = [];
  let pasoAHumano = false;
  const herramientas = herramientasDelAgente(
    {
      ...contexto,
      async alPasarAHumano(motivo, resumen) {
        pasoAHumano = true;
        await contexto.alPasarAHumano(motivo, resumen);
      },
    },
    llamadas,
  );

  const mensajes = historial
    .filter((turno) => turno.texto.trim())
    .map((turno) => ({ role: turno.rol === "cliente" ? ("user" as const) : ("assistant" as const), content: turno.texto }));
  // La plática siempre empieza por lo que escribió la persona.
  while (mensajes[0]?.role === "assistant") mensajes.shift();
  if (mensajes.length === 0) throw new Error("No hay nada que contestar.");

  const { texto, rechazo } = await modelo.correr({ sistema: GUION, mensajes, herramientas });

  // Si el modelo se negó o no dijo nada, la persona no se queda sin respuesta: la atiende alguien del equipo.
  if (rechazo || !texto) {
    if (!pasoAHumano) await contexto.alPasarAHumano(rechazo ? "El agente no pudo contestar" : "El agente se quedó sin respuesta", "Revisar la plática.");
    return { texto: texto || DESPEDIDA, herramientas: llamadas, pasoAHumano: true };
  }
  return { texto, herramientas: llamadas, pasoAHumano };
}
