import { useState } from "react";
import { api } from "../api.ts";
import { etiquetaDeBloque } from "../../../shared/bloques.ts";
import { fechaCorta } from "../../../shared/fechas.ts";
import { NOMBRE_DE_TIPO } from "../../../shared/precios.ts";
import { telefonoBonito } from "../../../shared/telefono.ts";
import type { EstadoDeLiquidacion, Servicio } from "../../../shared/tipos.ts";
import { Boton, Campo, CLASE_DE_ENTRADA, Cargando, Etiqueta, Mensaje, Tarjeta, Vacio, pesos, useAccion, useDatos } from "../ui.tsx";
import { EtiquetaDeEstado, horaLocal, NOMBRE_DE_EVENTO, nombreDeCiudad, quienFue } from "./comunes.tsx";

const FILTROS = [
  { valor: "", texto: "Todos" },
  { valor: "agendado", texto: "Agendado" },
  { valor: "tomado", texto: "Tomado" },
  { valor: "en_camino", texto: "En camino" },
  { valor: "realizado", texto: "Realizado" },
  { valor: "cancelado", texto: "Cancelado" },
];

const COBRO: Record<EstadoDeLiquidacion, string> = {
  no_aplica: "—",
  pendiente: "Por cobrar",
  reportada: "Reportada",
  pagada: "Cobrada",
};

const comision = (servicio: Servicio) =>
  servicio.comision_monto === null ? "—" : `${pesos(servicio.comision_monto)} · ${COBRO[servicio.liquidacion_estado]}`;

export function Servicios() {
  const [estado, setEstado] = useState("");
  const [abierto, setAbierto] = useState<number>();

  if (abierto !== undefined) return <Detalle key={abierto} id={abierto} alVolver={() => setAbierto(undefined)} />;

  return (
    <div className="space-y-4">
      <Tarjeta>
        <Campo etiqueta="Estado">
          <select className={CLASE_DE_ENTRADA} value={estado} onChange={(e) => setEstado(e.target.value)}>
            {FILTROS.map((filtro) => (
              <option key={filtro.valor} value={filtro.valor}>
                {filtro.texto}
              </option>
            ))}
          </select>
        </Campo>
      </Tarjeta>
      <Lista key={estado} estado={estado} alAbrir={setAbierto} />
    </div>
  );
}

function Lista({ estado, alAbrir }: { estado: string; alAbrir: (id: number) => void }) {
  const { datos, error } = useDatos(() => api.servicios(estado ? { estado } : {}), 30);

  if (error) return <Mensaje>{error}</Mensaje>;
  if (!datos) return <Cargando />;
  if (datos.length === 0) return <Vacio>No hay servicios con este filtro.</Vacio>;

  return (
    <>
      <Tarjeta className="hidden overflow-x-auto !p-0 md:block">
        <table className="w-full text-sm">
          <thead className="bg-fondo text-left text-xs uppercase text-tenue">
            <tr>
              {["#", "Cuándo", "Dónde", "Cliente", "Tipo", "Precio", "Estado", "Proveedor", "Comisión"].map((titulo) => (
                <th key={titulo} scope="col" className="px-3 py-2">
                  {titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-linea">
            {datos.map((s) => (
              <tr key={s.id} className="align-top">
                <td className="px-3 py-2">
                  <Boton chico tono="claro" onClick={() => alAbrir(s.id)} aria-label={`Abrir servicio ${s.id}`}>
                    #{s.id}
                  </Boton>
                </td>
                <td className="px-3 py-2">
                  {fechaCorta(s.fecha)}
                  <br />
                  <span className="text-tenue">{etiquetaDeBloque(s.bloque)}</span>
                </td>
                <td className="px-3 py-2">
                  {nombreDeCiudad(s.ciudad)}
                  {s.colonia && <span className="block text-tenue">{s.colonia}</span>}
                </td>
                <td className="px-3 py-2">
                  {s.cliente_nombre}
                  <span className="block text-tenue">{telefonoBonito(s.cliente_telefono)}</span>
                </td>
                <td className="px-3 py-2">{NOMBRE_DE_TIPO[s.tipo]}</td>
                <td className="px-3 py-2">{pesos(s.precio)}</td>
                <td className="px-3 py-2">
                  <EtiquetaDeEstado estado={s.estado} />
                </td>
                <td className="px-3 py-2">{s.proveedor_nombre ?? "—"}</td>
                <td className="px-3 py-2">{comision(s)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tarjeta>

      <div className="space-y-3 md:hidden">
        {datos.map((s) => (
          <button key={s.id} type="button" onClick={() => alAbrir(s.id)} className="block w-full rounded-2xl border border-linea bg-white p-4 text-left shadow-sm">
            <span className="flex items-center justify-between gap-2">
              <span className="font-bold">
                #{s.id} · {fechaCorta(s.fecha)} {etiquetaDeBloque(s.bloque)}
              </span>
              <EtiquetaDeEstado estado={s.estado} />
            </span>
            <span className="mt-1 block text-sm">
              {s.cliente_nombre} · {telefonoBonito(s.cliente_telefono)}
            </span>
            <span className="block text-sm text-tenue">
              {nombreDeCiudad(s.ciudad)}
              {s.colonia ? `, ${s.colonia}` : ""} · {NOMBRE_DE_TIPO[s.tipo]} · {pesos(s.precio)}
            </span>
            <span className="block text-sm text-tenue">
              Proveedor: {s.proveedor_nombre ?? "—"} · Comisión: {comision(s)}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-tenue">{titulo}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Detalle({ id, alVolver }: { id: number; alVolver: () => void }) {
  const { datos, error, recargar } = useDatos(() => api.servicio(id));
  const accion = useAccion();
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState("");

  const correr = (hacer: () => Promise<unknown>) =>
    accion.correr(async () => {
      await hacer();
      setCancelando(false);
      await recargar();
    });

  if (error) return <Mensaje>{error}</Mensaje>;
  if (!datos) return <Cargando />;
  const { servicio: s, eventos } = datos;
  const abierto = s.estado !== "realizado" && s.estado !== "cancelado";
  const porConfirmar = s.estado === "realizado" && (s.liquidacion_estado === "pendiente" || s.liquidacion_estado === "reportada");

  return (
    <div className="space-y-4">
      <Boton tono="claro" chico onClick={alVolver}>
        ← Volver a servicios
      </Boton>
      <Tarjeta className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Servicio #{s.id}</h2>
          <EtiquetaDeEstado estado={s.estado} />
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Dato titulo="Cuándo">
            {fechaCorta(s.fecha)} {etiquetaDeBloque(s.bloque)}
          </Dato>
          <Dato titulo="Cliente">
            {s.cliente_nombre} · {telefonoBonito(s.cliente_telefono)}
          </Dato>
          <Dato titulo="Ciudad y colonia">
            {nombreDeCiudad(s.ciudad)}
            {s.colonia ? `, ${s.colonia}` : ""}
          </Dato>
          <Dato titulo="Domicilio">{s.direccion ?? "—"}</Dato>
          <Dato titulo="Servicio">
            {NOMBRE_DE_TIPO[s.tipo]}
            {s.litros ? ` · ${s.litros} L` : ""}
          </Dato>
          <Dato titulo="Precio">{pesos(s.precio)}</Dato>
          <Dato titulo="Proveedor">{s.proveedor_nombre ?? "Sin proveedor"}</Dato>
          <Dato titulo="Comisión">
            {s.comision_monto === null ? "—" : `${pesos(s.comision_monto)} (${s.comision_pct}%) · ${COBRO[s.liquidacion_estado]}`}
          </Dato>
          <Dato titulo="Origen">{s.origen}</Dato>
          <Dato titulo="Notas">{s.notas ?? "—"}</Dato>
          {s.motivo_cancelacion && <Dato titulo="Motivo de cancelación">{s.motivo_cancelacion}</Dato>}
        </dl>

        {porConfirmar && s.liquidacion_nota && <Mensaje tipo="nota">Nota del proveedor: {s.liquidacion_nota}</Mensaje>}
        {accion.error && <Mensaje>{accion.error}</Mensaje>}

        {cancelando ? (
          <div className="space-y-2 rounded-xl border border-red-200 p-3">
            <Campo etiqueta="Motivo de la cancelación" ayuda="Mínimo 3 letras.">
              <textarea className={CLASE_DE_ENTRADA} rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </Campo>
            <div className="flex flex-wrap gap-2">
              <Boton tono="peligro" chico disabled={accion.ocupado || motivo.trim().length < 3} onClick={() => void correr(() => api.cancelar(s.id, motivo.trim()))}>
                Cancelar servicio
              </Boton>
              <Boton tono="claro" chico onClick={() => setCancelando(false)}>
                No cancelar
              </Boton>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {porConfirmar && (
              <Boton chico disabled={accion.ocupado} onClick={() => void correr(() => api.confirmarLiquidacion(s.id))}>
                Confirmar comisión recibida
              </Boton>
            )}
            {(s.estado === "tomado" || s.estado === "en_camino") && (
              <Boton tono="claro" chico disabled={accion.ocupado} onClick={() => void correr(() => api.soltar(s.id))}>
                Quitar proveedor y volver a ofrecer
              </Boton>
            )}
            {abierto && (
              <Boton tono="peligro" chico disabled={accion.ocupado} onClick={() => setCancelando(true)}>
                Cancelar
              </Boton>
            )}
          </div>
        )}
      </Tarjeta>

      <Tarjeta>
        <h3 className="mb-2 font-bold">Bitácora</h3>
        {eventos.length === 0 ? (
          <p className="text-sm text-tenue">Sin movimientos.</p>
        ) : (
          <ul className="divide-y divide-linea text-sm">
            {eventos.map((evento, i) => (
              <li key={i} className="py-2">
                <Etiqueta>{NOMBRE_DE_EVENTO[evento.tipo] ?? evento.tipo}</Etiqueta> <span className="font-semibold">{quienFue(evento.actor)}</span>
                {evento.detalle && <span> · {evento.detalle}</span>}
                <span className="block text-xs text-tenue">{horaLocal(evento.creado_en)}</span>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
