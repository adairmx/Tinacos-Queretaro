import { api } from "../api.ts";
import { enlaceWhatsApp } from "../../../shared/telefono.ts";
import { Cargando, EnlaceBoton, Mensaje, Tarjeta, Vacio, pesos, useDatos } from "../ui.tsx";

export function Cuentas() {
  const { datos, error } = useDatos(api.cuentas);

  if (error) return <Mensaje>{error}</Mensaje>;
  if (!datos) return <Cargando />;
  if (datos.length === 0) return <Vacio>Todavía no hay proveedores con cuentas.</Vacio>;

  const total = (campo: "servicios_realizados" | "por_cobrar" | "reportado" | "cobrado") => datos.reduce((suma, fila) => suma + fila[campo], 0);
  const celda = "px-3 py-2 text-right";

  return (
    <div className="space-y-3">
      <Mensaje tipo="nota">El detalle de cada cobro se confirma en Servicios → Realizado.</Mensaje>
      <Tarjeta className="overflow-x-auto !p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-fondo text-xs uppercase text-tenue">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">Proveedor</th>
              <th scope="col" className={celda}>Servicios realizados</th>
              <th scope="col" className={celda}>Por cobrar</th>
              <th scope="col" className={celda}>Ya reportado</th>
              <th scope="col" className={celda}>Cobrado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-linea">
            {datos.map((fila) => (
              <tr key={fila.proveedor_id}>
                <th scope="row" className="px-3 py-2 text-left font-semibold">
                  <div className="flex items-center gap-2">
                    {fila.nombre}
                    <EnlaceBoton chico href={enlaceWhatsApp(fila.telefono, "")}>WhatsApp</EnlaceBoton>
                  </div>
                </th>
                <td className={celda}>{fila.servicios_realizados}</td>
                <td className={celda}>{pesos(fila.por_cobrar)}</td>
                <td className={celda}>{pesos(fila.reportado)}</td>
                <td className={celda}>{pesos(fila.cobrado)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-linea bg-fondo font-bold">
            <tr>
              <th scope="row" className="px-3 py-2 text-left">Total</th>
              <td className={celda}>{total("servicios_realizados")}</td>
              <td className={celda}>{pesos(total("por_cobrar"))}</td>
              <td className={celda}>{pesos(total("reportado"))}</td>
              <td className={celda}>{pesos(total("cobrado"))}</td>
            </tr>
          </tfoot>
        </table>
      </Tarjeta>
    </div>
  );
}
