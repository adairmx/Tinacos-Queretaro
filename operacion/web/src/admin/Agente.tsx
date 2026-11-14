import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, type TurnoDePrueba } from "../api.ts";
import { Boton, Cargando, Entrada, Mensaje, Tarjeta, useAccion, useDatos } from "../ui.tsx";

interface Linea extends TurnoDePrueba {
  /** Lo que el agente consultó o hizo para dar esta respuesta. */
  hizo?: string[];
}

const NOMBRE_DE_HERRAMIENTA: Record<string, string> = {
  consultar_horarios: "Consultó los horarios",
  agendar_servicio: "Agendó la cita (simulacro, no se guardó)",
  pasar_a_humano: "Le pasó la plática a una persona (simulacro)",
};

/** Simulador: platicar con el agente como si fueras un cliente, antes de conectarlo a WhatsApp. */
export function Agente() {
  const estado = useDatos(api.agente);
  const [platica, setPlatica] = useState<Linea[]>([]);
  const [texto, setTexto] = useState("");
  const { ocupado, error, correr } = useAccion();
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => fin.current?.scrollIntoView({ block: "nearest" }), [platica, ocupado]);

  if (estado.error) return <Mensaje>{estado.error}</Mensaje>;
  if (!estado.datos) return <Cargando />;
  const { configurado, contestaSolo, modelo, guion } = estado.datos;

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const dicho = texto.trim();
    if (!dicho || ocupado) return;
    const conLoNuevo: Linea[] = [...platica, { rol: "cliente", texto: dicho }];
    setPlatica(conLoNuevo);
    setTexto("");
    await correr(async () => {
      const respuesta = await api.probarAgente(conLoNuevo.map(({ rol, texto }) => ({ rol, texto })));
      setPlatica([...conLoNuevo, { rol: "agente", texto: respuesta.texto, hizo: respuesta.herramientas.map((h) => NOMBRE_DE_HERRAMIENTA[h.nombre] ?? h.nombre) }]);
    });
  };

  return (
    <div className="space-y-4">
      {!configurado ? (
        <Mensaje tipo="nota">
          Al agente le falta la llave de Claude. Agrega la variable <strong>ANTHROPIC_API_KEY</strong> en el servidor y vuelve a esta pantalla.
        </Mensaje>
      ) : contestaSolo ? (
        <Mensaje tipo="bien">El agente está contestando solo los WhatsApp de quien pide informes. Aquí puedes probarlo sin que nada se guarde.</Mensaje>
      ) : (
        <Mensaje tipo="nota">El agente todavía no contesta WhatsApp. Aquí puedes platicar con él como si fueras un cliente; usa los horarios reales, pero no agenda ni avisa a nadie.</Mensaje>
      )}

      <Tarjeta className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Probar al agente</h2>
          {platica.length > 0 && (
            <Boton chico tono="claro" onClick={() => setPlatica([])}>
              Empezar de nuevo
            </Boton>
          )}
        </div>

        <div className="max-h-[55vh] space-y-2 overflow-y-auto rounded-xl bg-fondo p-3" aria-live="polite">
          {platica.length === 0 && <p className="py-6 text-center text-sm text-tenue">Escribe como lo haría un cliente. Por ejemplo: «Hola, ¿cuánto cuesta lavar un tinaco?»</p>}
          {platica.map((linea, i) => (
            <div key={i} className={linea.rol === "cliente" ? "flex justify-end" : "flex justify-start"}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${linea.rol === "cliente" ? "bg-marca text-white" : "border border-linea bg-white"}`}>
                <p className="whitespace-pre-wrap">{linea.texto}</p>
                {linea.hizo?.map((paso, j) => (
                  <p key={j} className="mt-1 text-xs text-tenue">
                    {paso}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {ocupado && <p className="text-sm text-tenue">El agente está escribiendo…</p>}
          <div ref={fin} />
        </div>

        {error && <Mensaje>{error}</Mensaje>}
        <form onSubmit={(e) => void enviar(e)} className="flex gap-2">
          <Entrada value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe como cliente…" aria-label="Mensaje del cliente" maxLength={2000} disabled={!configurado} />
          <Boton type="submit" disabled={!configurado || ocupado || !texto.trim()}>
            Enviar
          </Boton>
        </form>
      </Tarjeta>

      <details className="rounded-2xl border border-linea bg-white p-4">
        <summary className="cursor-pointer font-semibold">Ver el guion del agente</summary>
        <p className="mt-2 text-xs text-tenue">Primera versión, hecha con lo que has dicho de tu operación y lo que publica el sitio. Modelo: {modelo}.</p>
        <pre className="mt-3 whitespace-pre-wrap text-sm">{guion}</pre>
      </details>
    </div>
  );
}
