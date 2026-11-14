import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, ErrorDeApi } from "../api.ts";
import { BLOQUES, etiquetaDeBloque } from "../../../shared/bloques.ts";
import { CIUDADES, ciudadPorSlug } from "../../../shared/ciudades.ts";
import { ahoraEn, fechaCorta } from "../../../shared/fechas.ts";
import { NOMBRE_DE_TIPO, PRECIO_BASE, TIPOS_DE_SERVICIO, type TipoDeServicio } from "../../../shared/precios.ts";
import { normalizarTelefono } from "../../../shared/telefono.ts";
import type { OpcionDeHorario, Prospecto, Servicio } from "../../../shared/tipos.ts";
import { Boton, Campo, CLASE_DE_ENTRADA, Cargando, Entrada, Mensaje, Tarjeta, useAccion, useDatos } from "../ui.tsx";
import { nombreDeCiudad } from "./comunes.tsx";

/** Agenda una cita. Con `?prospecto=7` llega desde la bandeja de leads con los datos de esa persona ya puestos. */
export function Agendar({ alAgendar }: { alAgendar?: () => void }) {
  const [parametros, setParametros] = useSearchParams();
  const prospectoId = Number(parametros.get("prospecto")) || undefined;
  const [agendado, setAgendado] = useState<Servicio>();

  const terminar = (servicio: Servicio) => {
    setAgendado(servicio);
    setParametros({}, { replace: true });
    alAgendar?.();
  };

  return (
    <div className="space-y-4">
      {agendado && (
        <Mensaje tipo="bien">
          Servicio #{agendado.id} agendado para {fechaCorta(agendado.fecha)}, {etiquetaDeBloque(agendado.bloque)} Ya se generaron los avisos a los
          proveedores.{" "}
          <Link to="/admin/avisos" className="font-semibold underline">
            Ver avisos
          </Link>
        </Mensaje>
      )}
      {prospectoId ? (
        <AgendaDeProspecto key={prospectoId} id={prospectoId} alAgendar={terminar} alCancelar={() => setParametros({}, { replace: true })} />
      ) : (
        <Agenda alAgendar={terminar} alCambiarCiudad={() => setAgendado(undefined)} />
      )}
    </div>
  );
}

function AgendaDeProspecto({ id, alAgendar, alCancelar }: { id: number; alAgendar: (servicio: Servicio) => void; alCancelar: () => void }) {
  const { datos, error } = useDatos(() => api.prospecto(id));
  if (error) return <Mensaje>{error}</Mensaje>;
  if (!datos) return <Cargando />;

  return (
    <>
      <Mensaje tipo="nota">
        Agendando el lead de <strong>{datos.nombre}</strong>.{" "}
        <button type="button" className="font-semibold underline" onClick={alCancelar}>
          Agendar a otra persona
        </button>
      </Mensaje>
      <Agenda prospecto={datos} alAgendar={alAgendar} />
    </>
  );
}

function Agenda({ prospecto, alAgendar, alCambiarCiudad }: { prospecto?: Prospecto; alAgendar: (servicio: Servicio) => void; alCambiarCiudad?: () => void }) {
  const [ciudad, setCiudad] = useState(prospecto?.ciudad ?? "queretaro");
  // Cambiar `version` vuelve a montar el formulario: horarios frescos y datos del cliente en blanco.
  const [version, setVersion] = useState(0);

  return (
    <>
      <Tarjeta>
        <Campo etiqueta="Ciudad">
          <select
            className={CLASE_DE_ENTRADA}
            value={ciudad}
            onChange={(e) => {
              setCiudad(e.target.value);
              alCambiarCiudad?.();
            }}
          >
            {CIUDADES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </Tarjeta>
      <FormularioDeCita
        key={`${ciudad}-${version}`}
        ciudad={ciudad}
        prospecto={prospecto}
        alAgendar={(servicio) => {
          setVersion((v) => v + 1);
          alAgendar(servicio);
        }}
      />
    </>
  );
}

const mismoHorario = (a: { fecha: string; bloque: string }, b: { fecha: string; bloque: string } | undefined) =>
  !!b && a.fecha === b.fecha && a.bloque === b.bloque;

function FormularioDeCita({ ciudad, prospecto, alAgendar }: { ciudad: string; prospecto?: Prospecto; alAgendar: (servicio: Servicio) => void }) {
  const { datos, error, recargar } = useDatos(() => api.horarios(ciudad));
  const accion = useAccion();
  const hoy = ahoraEn(ciudadPorSlug(ciudad)?.zona ?? "America/Mexico_City").fecha;

  const [elegido, setElegido] = useState<OpcionDeHorario>();
  const [forzar, setForzar] = useState(false);
  const [fechaManual, setFechaManual] = useState(hoy);
  const [bloqueManual, setBloqueManual] = useState(BLOQUES[0]?.id ?? "");

  const [nombre, setNombre] = useState(prospecto?.nombre ?? "");
  const [telefono, setTelefono] = useState(prospecto?.telefono ?? "");
  const [colonia, setColonia] = useState(prospecto?.colonia ?? "");
  const [direccion, setDireccion] = useState("");
  const [tipo, setTipo] = useState<TipoDeServicio>(prospecto?.tipo ?? "tinaco");
  const [litros, setLitros] = useState(prospecto?.litros ? String(prospecto.litros) : "");
  const [precio, setPrecio] = useState(String(PRECIO_BASE[prospecto?.tipo ?? "tinaco"]));
  const [notas, setNotas] = useState(prospecto?.notas ?? "");
  const [problema, setProblema] = useState<string>();

  if (error) return <Mensaje>{error}</Mensaje>;
  if (!datos) return <Cargando />;

  const horario = forzar ? (fechaManual && bloqueManual ? { fecha: fechaManual, bloque: bloqueManual } : undefined) : elegido;
  const sinOpciones = datos.opciones.length === 0;

  const cambiarTipo = (nuevo: TipoDeServicio) => {
    setTipo(nuevo);
    setPrecio(String(PRECIO_BASE[nuevo]));
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setProblema(undefined);
    const diez = normalizarTelefono(telefono);
    const precioEntero = Number(precio);
    const litrosEnteros = litros.trim() === "" ? null : Number(litros);
    if (!horario) return;
    if (!nombre.trim()) return setProblema("Escribe el nombre del cliente.");
    if (!diez) return setProblema("El teléfono debe tener 10 dígitos.");
    if (!Number.isInteger(precioEntero) || precioEntero < 0) return setProblema("El precio debe ser un número entero.");
    if (litrosEnteros !== null && (!Number.isInteger(litrosEnteros) || litrosEnteros <= 0)) return setProblema("Los litros deben ser un número entero.");

    let servicio: Servicio | undefined;
    const bien = await accion.correr(async () => {
      try {
        servicio = await api.agendar({
          cliente_nombre: nombre.trim(),
          cliente_telefono: diez,
          ciudad,
          colonia: colonia.trim() || null,
          direccion: direccion.trim() || null,
          tipo,
          litros: litrosEnteros,
          precio: precioEntero,
          fecha: horario.fecha,
          bloque: horario.bloque,
          notas: notas.trim() || null,
          origen: prospecto?.origen ?? "admin",
          ...(prospecto ? { prospecto_id: prospecto.id } : {}),
          ...(forzar ? { forzar: true } : {}),
        });
      } catch (fallo) {
        if (fallo instanceof ErrorDeApi && fallo.codigo === "sin_cupo") {
          setElegido(undefined);
          await recargar();
        }
        throw fallo;
      }
    });
    if (bien && servicio) alAgendar(servicio);
  };

  return (
    <form onSubmit={(e) => void enviar(e)} className="space-y-4">
      <Tarjeta className="space-y-3">
        <h2 className="text-lg font-bold">Dile al cliente</h2>
        {sinOpciones ? (
          <Mensaje tipo="nota">No hay proveedores con disponibilidad en {nombreDeCiudad(ciudad)}.</Mensaje>
        ) : (
          <div role="radiogroup" aria-label="Horarios para ofrecer" className="grid gap-3 sm:grid-cols-2">
            {datos.opciones.map((opcion) => (
              <TarjetaDeHorario key={`${opcion.fecha}-${opcion.bloque}`} opcion={opcion} activa={!forzar && mismoHorario(opcion, elegido)} alElegir={() => setElegido(opcion)} grande />
            ))}
          </div>
        )}
        {datos.todos.length > 0 && (
          <details className="rounded-xl border border-linea p-3">
            <summary className="cursor-pointer font-semibold">Ver todos los horarios con lugar</summary>
            <div role="radiogroup" aria-label="Todos los horarios" className="mt-3 grid gap-2 sm:grid-cols-2">
              {datos.todos.map((opcion) => (
                <TarjetaDeHorario key={`${opcion.fecha}-${opcion.bloque}`} opcion={opcion} activa={!forzar && mismoHorario(opcion, elegido)} alElegir={() => setElegido(opcion)} />
              ))}
            </div>
          </details>
        )}
        <label className="flex items-center gap-2 font-semibold">
          <input type="checkbox" className="size-5 accent-marca" checked={forzar} onChange={(e) => setForzar(e.target.checked)} />
          Agendar de todos modos
        </label>
        {forzar && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Fecha">
              <Entrada type="date" min={hoy} value={fechaManual} onChange={(e) => setFechaManual(e.target.value)} required />
            </Campo>
            <Campo etiqueta="Horario">
              <select className={CLASE_DE_ENTRADA} value={bloqueManual} onChange={(e) => setBloqueManual(e.target.value)}>
                {BLOQUES.map((bloque) => (
                  <option key={bloque.id} value={bloque.id}>
                    {etiquetaDeBloque(bloque.id)}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
        )}
      </Tarjeta>

      <Tarjeta className="space-y-3">
        <h2 className="text-lg font-bold">Datos del cliente</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Nombre">
            <Entrada value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="off" required />
          </Campo>
          <Campo etiqueta="Teléfono (10 dígitos)">
            <Entrada type="tel" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="off" required />
          </Campo>
          <Campo etiqueta="Colonia">
            <Entrada value={colonia} onChange={(e) => setColonia(e.target.value)} autoComplete="off" />
          </Campo>
          <Campo etiqueta="Domicilio">
            <Entrada value={direccion} onChange={(e) => setDireccion(e.target.value)} autoComplete="off" />
          </Campo>
          <Campo etiqueta="Tipo de servicio">
            <select className={CLASE_DE_ENTRADA} value={tipo} onChange={(e) => cambiarTipo(e.target.value as TipoDeServicio)}>
              {TIPOS_DE_SERVICIO.map((t) => (
                <option key={t} value={t}>
                  {NOMBRE_DE_TIPO[t]}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Litros (opcional)">
            <Entrada type="number" inputMode="numeric" min={1} value={litros} onChange={(e) => setLitros(e.target.value)} />
          </Campo>
          <Campo etiqueta="Precio (pesos)">
            <Entrada type="number" inputMode="numeric" min={0} step={1} value={precio} onChange={(e) => setPrecio(e.target.value)} required />
          </Campo>
        </div>
        <Campo etiqueta="Notas">
          <textarea className={CLASE_DE_ENTRADA} rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} />
        </Campo>
        {(problema ?? accion.error) && <Mensaje>{problema ?? accion.error}</Mensaje>}
        <Boton type="submit" tono="acento" ancho disabled={!horario || accion.ocupado}>
          {accion.ocupado ? "Agendando…" : "Agendar servicio"}
        </Boton>
      </Tarjeta>
    </form>
  );
}

function TarjetaDeHorario({ opcion, activa, alElegir, grande }: { opcion: OpcionDeHorario; activa: boolean; alElegir: () => void; grande?: boolean }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={activa}
      onClick={alElegir}
      className={`rounded-2xl border-2 text-left transition ${grande ? "p-4 text-lg" : "p-3 text-base"} ${activa ? "border-marca bg-marca-suave" : "border-linea bg-white hover:bg-fondo"}`}
    >
      <span className="block font-semibold">{opcion.texto}</span>
      <span className="mt-1 block text-sm text-tenue">
        {opcion.cupo === 1 ? "Queda 1 lugar" : `Quedan ${opcion.cupo} lugares`}
      </span>
    </button>
  );
}
