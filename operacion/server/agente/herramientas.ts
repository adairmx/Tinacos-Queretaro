import { z } from "zod";
import { BLOQUES, textoDeBloque } from "../../shared/bloques.ts";
import { CIUDADES, ciudadPorSlug } from "../../shared/ciudades.ts";
import { fechaCorta } from "../../shared/fechas.ts";
import { NOMBRE_DE_TIPO, PRECIO_BASE } from "../../shared/precios.ts";
import { config } from "../config.ts";
import type { Db } from "../db.ts";
import { Rechazo } from "../lib/rechazo.ts";
import { cupoDe, elegirDos, horariosConCupo } from "../repos/disponibilidad.ts";
import { agendarServicio } from "../repos/servicios.ts";

/** Una herramienta que el agente puede usar: qué hace, qué datos pide y la función que la ejecuta. */
export interface Herramienta<Entrada = any> {
  nombre: string;
  descripcion: string;
  esquema: z.ZodType<Entrada>;
  correr(entrada: Entrada): Promise<string>;
}

export interface LlamadaDeHerramienta {
  nombre: string;
  entrada: unknown;
  resultado: string;
}

export interface Contexto {
  db: Db;
  /** Teléfono de quien escribe; el agente no lo pide ni lo puede cambiar. */
  telefono: string;
  /** En el simulador nada se guarda: los horarios son los reales, pero la cita no se crea. */
  simulado: boolean;
  /** El lead de esta persona en la bandeja, para ligarlo a la cita. */
  prospectoId?: number;
  ahora?: Date;
  /** Qué hacer cuando el agente decide pasarle la plática a una persona. */
  alPasarAHumano(motivo: string, resumen: string): Promise<void>;
}

const ciudad = z.enum(CIUDADES.map((c) => c.slug) as [string, ...string[]]).describe(`Ciudad del servicio: ${CIUDADES.map((c) => `${c.slug} (${c.nombre})`).join(", ")}`);

const horarios = z.object({ ciudad });

const cita = z.object({
  nombre: z.string().min(2).describe("Nombre de la persona que recibe el servicio"),
  ciudad,
  colonia: z.string().min(2).describe("Colonia o fraccionamiento"),
  direccion: z.string().min(3).describe("Calle y número"),
  tipo: z.enum(["tinaco", "cisterna", "ambos"]).describe("Qué se va a lavar"),
  litros: z.number().int().positive().optional().describe("Capacidad aproximada en litros, si la persona la dijo"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Fecha de un horario que regresó consultar_horarios, AAAA-MM-DD"),
  bloque: z.enum(BLOQUES.map((b) => b.id) as [string, ...string[]]).describe("Bloque de un horario que regresó consultar_horarios"),
  notas: z.string().optional().describe("Algo que el técnico deba saber: acceso, altura, referencias"),
});

const pase = z.object({
  motivo: z.string().min(3).describe("Por qué se le pasa a una persona, en una frase"),
  resumen: z.string().min(3).describe("Lo que la persona necesita y los datos que ya dio, para que nadie se los vuelva a pedir"),
});

/** Las herramientas del agente para una plática. `llamadas` va juntando lo que usó, para mostrarlo o revisarlo. */
export function herramientasDelAgente(contexto: Contexto, llamadas: LlamadaDeHerramienta[] = []): Herramienta[] {
  const ahora = () => contexto.ahora ?? new Date();

  const anotando = <E>(herramienta: Herramienta<E>): Herramienta<E> => ({
    ...herramienta,
    async correr(entrada) {
      const resultado = await herramienta.correr(entrada);
      llamadas.push({ nombre: herramienta.nombre, entrada, resultado });
      return resultado;
    },
  });

  return [
    anotando<z.infer<typeof horarios>>({
      nombre: "consultar_horarios",
      descripcion: "Regresa los horarios con lugar en una ciudad. Úsala antes de ofrecer cualquier día u hora y otra vez si un horario ya no tiene lugar.",
      esquema: horarios,
      async correr(entrada) {
        const todos = await horariosConCupo(contexto.db, entrada.ciudad, ahora(), config.anticipacionMinutos);
        const opciones = elegirDos(todos);
        if (opciones.length === 0) {
          return JSON.stringify({ disponibles: false, mensaje: `No hay horarios con lugar en ${ciudadPorSlug(entrada.ciudad)?.nombre}. Pásale la plática a una persona.` });
        }
        const breve = (o: { fecha: string; bloque: string; texto: string }) => ({ fecha: o.fecha, bloque: o.bloque, decir: o.texto });
        return JSON.stringify({ disponibles: true, ofrecer: opciones.map(breve), otros_por_si_pide: todos.filter((o) => !opciones.includes(o)).slice(0, 8).map(breve) });
      },
    }),

    anotando<z.infer<typeof cita>>({
      nombre: "agendar_servicio",
      descripcion: "Agenda el servicio en un horario que regresó consultar_horarios. Úsala cuando la persona ya eligió horario y dio sus datos. El precio lo pone el sistema.",
      esquema: cita,
      async correr(entrada) {
        const precio = PRECIO_BASE[entrada.tipo];
        const dicho = `${fechaCorta(entrada.fecha)} ${textoDeBloque(entrada.bloque)}`;
        try {
          if (contexto.simulado) {
            if ((await cupoDe(contexto.db, entrada.ciudad, entrada.fecha, entrada.bloque)) <= 0) throw new Rechazo("sin_cupo", "Ese horario ya no tiene lugar.");
            return JSON.stringify({ agendado: true, simulacro: true, horario: dicho, servicio: NOMBRE_DE_TIPO[entrada.tipo], precio });
          }
          const servicio = await agendarServicio(
            contexto.db,
            {
              cliente_nombre: entrada.nombre, cliente_telefono: contexto.telefono, ciudad: entrada.ciudad, colonia: entrada.colonia, direccion: entrada.direccion,
              tipo: entrada.tipo, litros: entrada.litros ?? null, fecha: entrada.fecha, bloque: entrada.bloque, notas: entrada.notas ?? null,
              origen: "agente_whatsapp", prospecto_id: contexto.prospectoId,
            },
            { actor: "agente", ahora: contexto.ahora },
          );
          return JSON.stringify({ agendado: true, folio: servicio.id, horario: dicho, servicio: NOMBRE_DE_TIPO[entrada.tipo], precio });
        } catch (error) {
          // Una regla del negocio dijo que no: se le explica al agente para que lo resuelva con la persona.
          if (error instanceof Rechazo) return JSON.stringify({ agendado: false, motivo: error.message });
          throw error;
        }
      },
    }),

    anotando<z.infer<typeof pase>>({
      nombre: "pasar_a_humano",
      descripcion: "Le pasa la plática a una persona del equipo. Después de usarla, despídete diciendo que en un momento le atienden.",
      esquema: pase,
      async correr(entrada) {
        await contexto.alPasarAHumano(entrada.motivo, entrada.resumen);
        return JSON.stringify({ pasado: true });
      },
    }),
  ];
}
