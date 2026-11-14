import { useState } from "react";
import { api } from "../api.ts";
import { PROTOCOLOS } from "../protocolos.ts";
import { useSesion } from "../sesion.tsx";
import { Boton, Mensaje, Tarjeta, useAccion } from "../ui.tsx";
import { ciudadPorSlug } from "../../../shared/ciudades.ts";
import { telefonoBonito } from "../../../shared/telefono.ts";
import type { Proveedor } from "../../../shared/tipos.ts";

const FORMAS = { por_servicio: "Servicio por servicio", semanal: "Corte semanal" };

function Dato({ nombre, valor }: { nombre: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-linea py-2 last:border-b-0">
      <dt className="text-tenue">{nombre}</dt>
      <dd className="text-right font-semibold">{valor}</dd>
    </div>
  );
}

function Protocolos({ proveedor, vigentes }: { proveedor: Proveedor; vigentes: boolean }) {
  const { recargar } = useSesion();
  const { ocupado, error, correr } = useAccion();
  const [leidos, setLeidos] = useState(false);

  const aceptar = async () => {
    if (await correr(api.aceptarProtocolos)) await recargar();
  };

  return (
    <Tarjeta className="space-y-4">
      <h2 className="text-xl font-extrabold">Protocolos de servicio</h2>
      {PROTOCOLOS.map((seccion) => (
        <div key={seccion.titulo}>
          <h3 className="font-bold text-marca-fuerte">{seccion.titulo}</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {seccion.puntos.map((punto) => (
              <li key={punto}>{punto}</li>
            ))}
          </ul>
        </div>
      ))}
      {vigentes ? (
        proveedor.protocolos_aceptados_en && (
          <Mensaje tipo="bien">
            Aceptados el {new Date(proveedor.protocolos_aceptados_en).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
          </Mensaje>
        )
      ) : (
        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm font-semibold">
            <input type="checkbox" checked={leidos} onChange={(e) => setLeidos(e.target.checked)} className="mt-0.5 h-6 w-6 shrink-0 accent-marca" />
            Leí y acepto los protocolos de servicio
          </label>
          {error && <Mensaje>{error}</Mensaje>}
          <Boton ancho disabled={!leidos || ocupado} onClick={() => void aceptar()}>
            Aceptar
          </Boton>
        </div>
      )}
    </Tarjeta>
  );
}

export default function Cuenta({ proveedor, protocolosVigentes }: { proveedor: Proveedor; protocolosVigentes: boolean }) {
  const { salir } = useSesion();
  return (
    <div className="space-y-4">
      <Tarjeta>
        <h2 className="mb-1 text-xl font-extrabold">Tus datos</h2>
        <dl className="text-sm">
          <Dato nombre="Nombre" valor={proveedor.nombre} />
          <Dato nombre="Teléfono" valor={telefonoBonito(proveedor.telefono)} />
          <Dato nombre="Ciudades" valor={proveedor.ciudades.map((c) => ciudadPorSlug(c)?.nombre ?? c).join(", ")} />
          <Dato nombre="Comisión de la casa" valor={`${proveedor.comision_pct} %`} />
          <Dato nombre="Forma de liquidar" valor={FORMAS[proveedor.liquidacion]} />
        </dl>
      </Tarjeta>
      <Protocolos proveedor={proveedor} vigentes={protocolosVigentes} />
      <Boton tono="peligro" ancho onClick={() => void salir()}>
        Cerrar sesión
      </Boton>
    </div>
  );
}
