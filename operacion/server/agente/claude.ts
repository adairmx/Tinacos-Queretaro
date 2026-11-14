import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { config } from "../config.ts";
import { Rechazo } from "../lib/rechazo.ts";
import type { Modelo } from "./agente.ts";

/** Lo que tiene arreglo desde el panel se dice claro; lo demás sube tal cual. */
function explicar(error: unknown): never {
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    throw new Rechazo("llave_invalida", "La llave de Claude (ANTHROPIC_API_KEY) no es válida o no tiene permiso.", 503);
  }
  if (error instanceof Anthropic.RateLimitError) throw new Rechazo("claude_ocupado", "Claude está recibiendo demasiadas peticiones. Intenta en un momento.", 503);
  if (error instanceof Anthropic.APIConnectionError) throw new Rechazo("claude_sin_conexion", "No se pudo conectar con Claude. Intenta de nuevo.", 503);
  throw error;
}

/**
 * El agente pensado por Claude. El SDK lleva el ir y venir con las herramientas; aquí sólo se le dice qué modelo,
 * con qué guion y con qué herramientas. Lee ANTHROPIC_API_KEY del entorno.
 */
export function crearModeloClaude(): Modelo {
  const cliente = new Anthropic();

  return {
    async correr({ sistema, mensajes, herramientas }) {
      const final = await cliente.beta.messages
        .toolRunner({
          model: config.agente.modelo,
          max_tokens: 8000,
          // Si el modelo se niega por sus filtros, la API reintenta sola con otro en la misma llamada.
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          output_config: { effort: config.agente.esfuerzo },
          // El guion no cambia entre pláticas: se deja en caché para que cada respuesta cueste y tarde menos.
          system: [{ type: "text", text: sistema, cache_control: { type: "ephemeral" } }],
          tools: herramientas.map((herramienta) =>
            betaZodTool({
              name: herramienta.nombre,
              description: herramienta.descripcion,
              inputSchema: herramienta.esquema,
              run: (entrada) => herramienta.correr(entrada),
            }),
          ),
          messages: mensajes,
          max_iterations: 8,
        })
        .then((mensaje) => mensaje, explicar);

      const texto = final.content
        .filter((bloque) => bloque.type === "text")
        .map((bloque) => bloque.text)
        .join("\n")
        .trim();
      return { texto, rechazo: final.stop_reason === "refusal" };
    },
  };
}
