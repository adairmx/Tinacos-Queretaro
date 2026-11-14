import { useState, type ReactNode } from "react";
import { api } from "../api.ts";
import { Boton, Cargando, Entrada, EnlaceBoton, Etiqueta, Mensaje, Tarjeta, Vacio, pesos, useAccion, useDatos } from "../ui.tsx";
import { bloquePorId, etiquetaDeBloque } from "../../../shared/bloques.ts";
import { ciudadPorSlug } from "../../../shared/ciudades.ts";
import { fechaCorta } from "../../../shared/fechas.ts";
import { NOMBRE_DE_TIPO } from "../../../shared/precios.ts";
import { enlaceWhatsApp, telefonoBonito } from "../../../shared/telefono.ts";
import type { Proveedor, Servicio } from "../../../shared/tipos.ts";

const momento = (s: Servicio) => `${s.fecha}${s.bloque}`;
const antes = (a: Servicio, b: Servicio) => momento(a).localeCompare(momento(b));

function Encabezado({ servicio }: { servicio: Servicio }) {
  const tipo = NOMBRE_DE_TIPO[servicio.tipo] + (servicio.litros ? ` · ${servicio.litros.toLocaleString("es-MX")} L` : "");
  const fija = bloquePorId(servicio.bloque)?.horaFija;
  return (
    <div>
      <h3 className="text-lg font-bold text-tinta">{tipo}</h3>
      <p className="text-sm text-tenue">
        {fechaCorta(servicio.fecha)} · {etiquetaDeBloque(servicio.bloque)}{" "}
        <Etiqueta color={fija ? "azul" : "gris"}>{fija ? "hora fija" : "hora aproximada"}</Etiqueta>
      </p>
    </div>
  );
}

function TarjetaAbierta({ servicio, comisionPct, ocupado, onTomar }: { servicio: Servicio; comisionPct: number; ocupado: boolean; onTomar: () => void }) {
  const comision = Math.round((servicio.precio * comisionPct) / 100);
  return (
    <Tarjeta className="space-y-3">
      <Encabezado servicio={servicio} />
      <p className="text-sm">
        📍 {servicio.colonia ? `${servicio.colonia}, ` : ""}
        {ciudadPorSlug(servicio.ciudad)?.nombre ?? servicio.ciudad}
      </p>
      <div className="rounded-xl bg-marca-suave px-3 py-2 text-sm">
        <p>
          Cliente paga <strong>{pesos(servicio.precio)}</strong> · Comisión de la casa {pesos(comision)}
        </p>
        <p className="text-base font-extrabold text-marca-fuerte">Tú recibes {pesos(servicio.precio - comision)}</p>
      </div>
      <Boton tono="acento" ancho disabled={ocupado} onClick={onTomar}>
        Tomar servicio
      </Boton>
    </Tarjeta>
  );
}

function TarjetaMia({ servicio, alCambiar }: { servicio: Servicio; alCambiar: () => void }) {
  const { ocupado, error, correr } = useAccion();
  const [confirmando, setConfirmando] = useState(false);
  const enCamino = servicio.estado === "en_camino";

  const avanzar = async () => {
    const bien = await correr(() => (enCamino ? api.realizado(servicio.id) : api.enCamino(servicio.id)));
    setConfirmando(false);
    if (bien) alCambiar();
  };

  return (
    <Tarjeta className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Encabezado servicio={servicio} />
        <Etiqueta color={enCamino ? "ambar" : "azul"}>{enCamino ? "En camino" : "Tomado"}</Etiqueta>
      </div>
      <div className="space-y-1 text-sm">
        <p className="text-base font-bold">{servicio.cliente_nombre}</p>
        <p>
          📍 {servicio.direccion ?? "Sin domicilio"}
          {servicio.colonia ? `, ${servicio.colonia}` : ""}
        </p>
        {servicio.notas && <p className="text-tenue">📝 {servicio.notas}</p>}
        <p>
          Cliente paga <strong>{pesos(servicio.precio)}</strong>
          {servicio.comision_monto !== null && ` · Comisión de la casa ${pesos(servicio.comision_monto)}`}
        </p>
      </div>
      <div>
        <p className="mb-1 text-sm font-semibold">{telefonoBonito(servicio.cliente_telefono)}</p>
        <div className="flex gap-2">
          <EnlaceBoton href={`tel:+52${servicio.cliente_telefono}`}>Llamar</EnlaceBoton>
          <EnlaceBoton href={enlaceWhatsApp(servicio.cliente_telefono, "")}>WhatsApp</EnlaceBoton>
        </div>
      </div>
      {error && <Mensaje>{error}</Mensaje>}
      {confirmando ? (
        <div className="space-y-2">
          <Mensaje tipo="nota">{enCamino ? "¿Ya terminaste el servicio?" : "Se le avisará al cliente que vas en camino. ¿Confirmas?"}</Mensaje>
          <div className="flex gap-2">
            <Boton ancho disabled={ocupado} onClick={() => void avanzar()}>
              Sí, confirmar
            </Boton>
            <Boton tono="claro" disabled={ocupado} onClick={() => setConfirmando(false)}>
              Cancelar
            </Boton>
          </div>
        </div>
      ) : (
        <Boton ancho onClick={() => setConfirmando(true)}>
          {enCamino ? "Terminé el servicio" : "Voy en camino"}
        </Boton>
      )}
    </Tarjeta>
  );
}

function TarjetaTerminada({ servicio, alCambiar }: { servicio: Servicio; alCambiar: () => void }) {
  const { ocupado, error, correr } = useAccion();
  const [nota, setNota] = useState("");

  const liquidar = async () => {
    if (await correr(() => api.liquidar(servicio.id, nota.trim()))) alCambiar();
  };

  return (
    <Tarjeta className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold">{servicio.cliente_nombre}</h3>
          <p className="text-sm text-tenue">
            {NOMBRE_DE_TIPO[servicio.tipo]} · {fechaCorta(servicio.fecha)}
          </p>
        </div>
        {servicio.liquidacion_estado === "reportada" && <Etiqueta color="ambar">Transferencia reportada, por confirmar</Etiqueta>}
        {servicio.liquidacion_estado === "pagada" && <Etiqueta color="verde">Comisión pagada</Etiqueta>}
        {servicio.liquidacion_estado === "no_aplica" && <Etiqueta color="gris">Sin comisión</Etiqueta>}
      </div>
      {servicio.liquidacion_estado === "pendiente" && (
        <div className="space-y-2">
          <p className="font-bold text-marca-fuerte">Comisión por transferir: {pesos(servicio.comision_monto ?? 0)}</p>
          <label className="block">
            <span className="sr-only">Nota de la transferencia</span>
            <Entrada placeholder="Nota (opcional), ej. Transferencia BBVA" value={nota} maxLength={200} onChange={(e) => setNota(e.target.value)} />
          </label>
          {error && <Mensaje>{error}</Mensaje>}
          <Boton ancho disabled={ocupado} onClick={() => void liquidar()}>
            Ya transferí la comisión
          </Boton>
        </div>
      )}
    </Tarjeta>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-extrabold">{titulo}</h2>
      {children}
    </section>
  );
}

export default function Servicios({ proveedor }: { proveedor: Proveedor }) {
  const { datos, error, recargar } = useDatos(api.misServicios, 20);
  const toma = useAccion();

  if (!datos) return error ? <Mensaje>{error}</Mensaje> : <Cargando />;

  // El error se muestra arriba de la lista y no en la tarjeta: si otro proveedor se adelantó, la tarjeta desaparece al recargar.
  const tomar = async (id: number) => {
    await toma.correr(() => api.tomar(id));
    await recargar();
  };

  const activos = datos.mios.filter((s) => s.estado === "tomado" || s.estado === "en_camino").sort(antes);
  const terminados = datos.mios.filter((s) => s.estado === "realizado").sort((a, b) => antes(b, a));

  return (
    <div className="space-y-6">
      {error && <Mensaje>{error}</Mensaje>}
      <Seccion titulo="Disponibles para tomar">
        {toma.error && <Mensaje>{toma.error}</Mensaje>}
        {datos.abiertos.length === 0 && <Vacio>Por ahora no hay servicios disponibles.</Vacio>}
        {[...datos.abiertos].sort(antes).map((s) => (
          <TarjetaAbierta key={s.id} servicio={s} comisionPct={proveedor.comision_pct} ocupado={toma.ocupado} onTomar={() => void tomar(s.id)} />
        ))}
      </Seccion>
      <Seccion titulo="Mis servicios">
        {activos.length === 0 && <Vacio>Todavía no tienes servicios tomados.</Vacio>}
        {activos.map((s) => (
          <TarjetaMia key={s.id} servicio={s} alCambiar={() => void recargar()} />
        ))}
      </Seccion>
      <Seccion titulo="Terminados">
        {terminados.length === 0 && <Vacio>Aquí verás los servicios que termines.</Vacio>}
        {terminados.map((s) => (
          <TarjetaTerminada key={s.id} servicio={s} alCambiar={() => void recargar()} />
        ))}
      </Seccion>
    </div>
  );
}
