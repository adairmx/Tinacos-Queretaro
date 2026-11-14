import { useEffect, useState } from "react";
import { api } from "../api.ts";
import { Boton, Cargando, Mensaje, useAccion, useDatos } from "../ui.tsx";
import { BLOQUES } from "../../../shared/bloques.ts";
import { fechaCorta, sumarDias } from "../../../shared/fechas.ts";

const FILA = "grid grid-cols-[minmax(5rem,1fr)_repeat(5,2.75rem)_3rem] items-center gap-1 px-2";
const clave = (fecha: string, bloque: string) => `${fecha}|${bloque}`;
const horaCorta = (minutos: number) => String(Math.floor(minutos / 60) % 12 || 12);

export default function Disponibilidad() {
  const { datos, error: errorDeCarga, recargar } = useDatos(api.miDisponibilidad);
  const { error, correr } = useAccion();
  const [marcados, setMarcados] = useState<Set<string>>();
  const [copiados, setCopiados] = useState<number>();

  useEffect(() => {
    if (datos) setMarcados(new Set(datos.espacios.map((e) => clave(e.fecha, e.bloque))));
  }, [datos]);

  if (!datos || !marcados) return errorDeCarga ? <Mensaje>{errorDeCarga}</Mensaje> : <Cargando />;

  // Del día de hoy al último día que acepta la agenda, ambos incluidos.
  const dias = Array.from({ length: datos.dias + 1 }, (_, i) => sumarDias(datos.hoy, i));

  // Se pinta al instante y, si el servidor dice que no, se regresa a como estaba.
  const cambiar = (celdas: { fecha: string; bloque: string }[], disponible: boolean) => {
    setCopiados(undefined);
    const previo = marcados;
    const nuevo = new Set(marcados);
    for (const c of celdas) {
      if (disponible) nuevo.add(clave(c.fecha, c.bloque));
      else nuevo.delete(clave(c.fecha, c.bloque));
    }
    setMarcados(nuevo);
    void correr(() => Promise.all(celdas.map((c) => api.fijarDisponibilidad(c.fecha, c.bloque, disponible)))).then((bien) => {
      if (!bien) setMarcados(previo);
    });
  };

  const alternar = (fecha: string, bloque: string) => cambiar([{ fecha, bloque }], !marcados.has(clave(fecha, bloque)));

  const todoElDia = (fecha: string) => {
    const lleno = BLOQUES.every((b) => marcados.has(clave(fecha, b.id)));
    const cambian = BLOQUES.filter((b) => marcados.has(clave(fecha, b.id)) === lleno);
    cambiar(cambian.map((b) => ({ fecha, bloque: b.id })), !lleno);
  };

  const repetir = async () => {
    setCopiados(undefined);
    const bien = await correr(async () => setCopiados((await api.copiarSemana(datos.hoy)).copiados));
    if (bien) await recargar();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">Disponibilidad</h2>
      <p className="text-sm text-tenue">
        Toca los horarios en los que puedes trabajar. De aquí salen las citas que se le ofrecen al cliente.
      </p>
      {error && <Mensaje>{error}</Mensaje>}
      <div className="overflow-hidden rounded-2xl border border-linea bg-white">
        <div className={`${FILA} border-b border-linea bg-fondo py-2 text-center text-xs font-bold text-tenue`}>
          <span className="text-left">Día</span>
          {BLOQUES.map((b) => (
            <span key={b.id}>
              {horaCorta(b.inicio)}
              {b.horaFija && "*"}
            </span>
          ))}
          <span />
        </div>
        {dias.map((fecha, i) => (
          <div key={fecha} className={`${FILA} border-b border-linea py-1 last:border-b-0`}>
            <span className="text-sm font-semibold leading-tight">
              {fechaCorta(fecha)}
              {i < 2 && <span className="block text-xs font-bold text-marca">{i === 0 ? "hoy" : "mañana"}</span>}
            </span>
            {BLOQUES.map((b) => {
              const activo = marcados.has(clave(fecha, b.id));
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={activo}
                  aria-label={`${fechaCorta(fecha)}, ${horaCorta(b.inicio)}`}
                  onClick={() => alternar(fecha, b.id)}
                  className={`h-11 w-11 rounded-lg border text-lg font-bold transition ${activo ? "border-marca bg-marca text-white" : "border-linea bg-white text-transparent hover:bg-fondo"}`}
                >
                  ✓
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => todoElDia(fecha)}
              className="h-11 rounded-lg text-xs font-bold text-marca hover:bg-marca-suave"
              aria-label={`Marcar o desmarcar todo el ${fechaCorta(fecha)}`}
            >
              Todo
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-tenue">
        Cada horario dura dos horas: 8, 10, 12, 2 y 4. El de las 8 (*) es de hora fija; los demás, de hora aproximada.
      </p>
      <Boton tono="claro" ancho onClick={() => void repetir()}>
        Repetir esta semana en la siguiente
      </Boton>
      {copiados !== undefined && <Mensaje tipo="bien">{copiados === 0 ? "No había espacios que copiar." : `Se copiaron ${copiados} espacios.`}</Mensaje>}
    </div>
  );
}
