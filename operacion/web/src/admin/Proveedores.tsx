import { useState, type FormEvent } from "react";
import { api, type CambiosDeProveedor } from "../api.ts";
import { enlaceWhatsApp, telefonoBonito, normalizarTelefono } from "../../../shared/telefono.ts";
import type { EstadoDeProveedor, ModoDeLiquidacion, Proveedor } from "../../../shared/tipos.ts";
import { Boton, Campo, CLASE_DE_ENTRADA, Cargando, Entrada, EnlaceBoton, Etiqueta, Mensaje, Tarjeta, Vacio, useAccion, useDatos } from "../ui.tsx";
import { horaLocal, nombreDeCiudad, SelectorDeCiudades } from "./comunes.tsx";

const COLOR_DE_ESTADO = { pendiente: "ambar", activo: "verde", suspendido: "rojo" } as const;

const CAMBIO_DE_ESTADO: Record<EstadoDeProveedor, { texto: string; nuevo: EstadoDeProveedor; tono: "primario" | "peligro" }> = {
  pendiente: { texto: "Activar", nuevo: "activo", tono: "primario" },
  activo: { texto: "Suspender", nuevo: "suspendido", tono: "peligro" },
  suspendido: { texto: "Reactivar", nuevo: "activo", tono: "primario" },
};

const FORMAS: Record<ModoDeLiquidacion, string> = { por_servicio: "Servicio por servicio", semanal: "Corte semanal" };

export function Proveedores() {
  const { datos, error, recargar } = useDatos(api.proveedores);

  return (
    <div className="space-y-4">
      <Alta alCrear={recargar} />
      {error && <Mensaje>{error}</Mensaje>}
      {!datos ? (
        !error && <Cargando />
      ) : datos.length === 0 ? (
        <Vacio>Todavía no hay proveedores.</Vacio>
      ) : (
        datos.map((proveedor) => <TarjetaDeProveedor key={proveedor.id} proveedor={proveedor} alCambiar={recargar} />)
      )}
    </div>
  );
}

function Alta({ alCrear }: { alCrear: () => Promise<void> }) {
  const accion = useAccion();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudades, setCiudades] = useState<string[]>([]);
  const [equipo, setEquipo] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [problema, setProblema] = useState<string>();
  const [creado, setCreado] = useState<string>();

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setProblema(undefined);
    setCreado(undefined);
    const diez = normalizarTelefono(telefono);
    if (!nombre.trim()) return setProblema("Escribe el nombre.");
    if (!diez) return setProblema("El teléfono debe tener 10 dígitos.");
    if (ciudades.length === 0) return setProblema("Elige al menos una ciudad.");
    const bien = await accion.correr(async () => {
      await api.crearProveedor({ nombre: nombre.trim(), telefono: diez, ciudades, equipo: equipo.trim() || null, experiencia: experiencia.trim() || null });
      await alCrear();
    });
    if (bien) {
      setCreado(nombre.trim());
      setNombre("");
      setTelefono("");
      setCiudades([]);
      setEquipo("");
      setExperiencia("");
    }
  };

  return (
    <Tarjeta>
      <details>
        <summary className="cursor-pointer font-bold">Dar de alta un proveedor</summary>
        <form onSubmit={(e) => void enviar(e)} className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Nombre">
              <Entrada value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="off" required />
            </Campo>
            <Campo etiqueta="Teléfono (10 dígitos)">
              <Entrada type="tel" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="off" required />
            </Campo>
          </div>
          <fieldset>
            <legend className="mb-1 text-sm font-semibold">Ciudades</legend>
            <SelectorDeCiudades valor={ciudades} alCambiar={setCiudades} />
          </fieldset>
          <Campo etiqueta="Equipo">
            <Entrada value={equipo} onChange={(e) => setEquipo(e.target.value)} />
          </Campo>
          <Campo etiqueta="Experiencia">
            <textarea className={CLASE_DE_ENTRADA} rows={2} value={experiencia} onChange={(e) => setExperiencia(e.target.value)} />
          </Campo>
          {(problema ?? accion.error) && <Mensaje>{problema ?? accion.error}</Mensaje>}
          {creado && <Mensaje tipo="bien">{creado} quedó dado de alta y activo.</Mensaje>}
          <Boton type="submit" disabled={accion.ocupado}>
            {accion.ocupado ? "Guardando…" : "Dar de alta"}
          </Boton>
        </form>
      </details>
    </Tarjeta>
  );
}

function TarjetaDeProveedor({ proveedor: p, alCambiar }: { proveedor: Proveedor; alCambiar: () => Promise<void> }) {
  const accion = useAccion();
  const [editando, setEditando] = useState(false);
  const cambio = CAMBIO_DE_ESTADO[p.estado];

  const guardar = (cambios: CambiosDeProveedor, alTerminar?: () => void) =>
    accion.correr(async () => {
      await api.cambiarProveedor(p.id, cambios);
      await alCambiar();
      alTerminar?.();
    });

  return (
    <Tarjeta className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{p.nombre}</h2>
        <Etiqueta color={COLOR_DE_ESTADO[p.estado]}>{p.estado[0]?.toUpperCase() + p.estado.slice(1)}</Etiqueta>
      </div>
      <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
        <div>
          <dt className="inline text-tenue">Teléfono: </dt>
          <dd className="inline">
            <a className="font-semibold text-marca underline" href={enlaceWhatsApp(p.telefono, "")} target="_blank" rel="noreferrer">
              {telefonoBonito(p.telefono)}
            </a>
          </dd>
        </div>
        <div>
          <dt className="inline text-tenue">Ciudades: </dt>
          <dd className="inline">{p.ciudades.map(nombreDeCiudad).join(", ") || "—"}</dd>
        </div>
        <div>
          <dt className="inline text-tenue">Comisión: </dt>
          <dd className="inline">{p.comision_pct}%</dd>
        </div>
        <div>
          <dt className="inline text-tenue">Liquida: </dt>
          <dd className="inline">{FORMAS[p.liquidacion]}</dd>
        </div>
        <div>
          <dt className="inline text-tenue">Protocolos: </dt>
          <dd className="inline">{p.protocolos_aceptados_en ? `aceptados ${horaLocal(p.protocolos_aceptados_en)}` : "sin aceptar"}</dd>
        </div>
        <div>
          <dt className="inline text-tenue">Equipo: </dt>
          <dd className="inline">{p.equipo ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="inline text-tenue">Experiencia: </dt>
          <dd className="inline">{p.experiencia ?? "—"}</dd>
        </div>
        {p.notas && (
          <div className="sm:col-span-2">
            <dt className="inline text-tenue">Notas: </dt>
            <dd className="inline">{p.notas}</dd>
          </div>
        )}
      </dl>

      {accion.error && <Mensaje>{accion.error}</Mensaje>}
      {editando ? (
        <Edicion proveedor={p} ocupado={accion.ocupado} alGuardar={(cambios) => void guardar(cambios, () => setEditando(false))} alCancelar={() => setEditando(false)} />
      ) : (
        <div className="flex flex-wrap gap-2">
          <Boton chico tono={cambio.tono} disabled={accion.ocupado} onClick={() => void guardar({ estado: cambio.nuevo })}>
            {cambio.texto}
          </Boton>
          <Boton chico tono="claro" onClick={() => setEditando(true)}>
            Editar
          </Boton>
        </div>
      )}
      <Acceso id={p.id} />
    </Tarjeta>
  );
}

function Edicion({ proveedor: p, ocupado, alGuardar, alCancelar }: { proveedor: Proveedor; ocupado: boolean; alGuardar: (cambios: CambiosDeProveedor) => void; alCancelar: () => void }) {
  const [comision, setComision] = useState(String(p.comision_pct));
  const [liquidacion, setLiquidacion] = useState(p.liquidacion);
  const [ciudades, setCiudades] = useState(p.ciudades);
  const [notas, setNotas] = useState(p.notas ?? "");
  const [problema, setProblema] = useState<string>();

  const guardar = () => {
    const pct = Number(comision);
    if (comision.trim() === "" || !Number.isInteger(pct) || pct < 0 || pct > 100) return setProblema("La comisión es un número entero de 0 a 100.");
    if (ciudades.length === 0) return setProblema("Elige al menos una ciudad.");
    setProblema(undefined);
    alGuardar({ comision_pct: pct, liquidacion, ciudades, notas: notas.trim() || null });
  };

  return (
    <div className="space-y-3 rounded-xl border border-linea p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Comisión (%)" ayuda="0 significa que no se le cobra.">
          <Entrada type="number" inputMode="numeric" min={0} max={100} step={1} value={comision} onChange={(e) => setComision(e.target.value)} />
        </Campo>
        <Campo etiqueta="Forma de liquidar">
          <select className={CLASE_DE_ENTRADA} value={liquidacion} onChange={(e) => setLiquidacion(e.target.value as ModoDeLiquidacion)}>
            {Object.entries(FORMAS).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-semibold">Ciudades</legend>
        <SelectorDeCiudades valor={ciudades} alCambiar={setCiudades} />
      </fieldset>
      <Campo etiqueta="Notas">
        <textarea className={CLASE_DE_ENTRADA} rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} />
      </Campo>
      {problema && <Mensaje>{problema}</Mensaje>}
      <div className="flex flex-wrap gap-2">
        <Boton chico disabled={ocupado} onClick={guardar}>
          Guardar
        </Boton>
        <Boton chico tono="claro" onClick={alCancelar}>
          Cancelar
        </Boton>
      </div>
    </div>
  );
}

function Acceso({ id }: { id: number }) {
  const accion = useAccion();
  const [acceso, setAcceso] = useState<{ enlace: string; whatsapp: string }>();
  const [copiado, setCopiado] = useState(false);

  const generar = () =>
    accion.correr(async () => {
      setCopiado(false);
      setAcceso(await api.accesoDeProveedor(id));
    });

  const copiar = async () => {
    if (!acceso) return;
    try {
      await navigator.clipboard.writeText(acceso.enlace);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className="space-y-2 border-t border-linea pt-3">
      <Boton chico tono="claro" disabled={accion.ocupado} onClick={() => void generar()}>
        Enlace de acceso
      </Boton>
      {accion.error && <Mensaje>{accion.error}</Mensaje>}
      {acceso && (
        <div className="space-y-2">
          <input readOnly aria-label="Enlace de acceso" value={acceso.enlace} onFocus={(e) => e.currentTarget.select()} className={CLASE_DE_ENTRADA} />
          <div className="flex flex-wrap gap-2">
            <Boton chico onClick={() => void copiar()}>
              {copiado ? "Copiado" : "Copiar"}
            </Boton>
            <EnlaceBoton chico tono="acento" href={acceso.whatsapp}>
              Mandar por WhatsApp
            </EnlaceBoton>
          </div>
          <p className="text-xs text-tenue">Sirve una sola vez y vence en 7 días.</p>
        </div>
      )}
    </div>
  );
}
