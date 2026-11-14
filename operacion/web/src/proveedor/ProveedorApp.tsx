import { NavLink, Route, Routes } from "react-router-dom";
import { Cargando, Mensaje } from "../ui.tsx";
import { useSesion } from "../sesion.tsx";
import type { Proveedor } from "../../../shared/tipos.ts";
import Cuenta from "./Cuenta.tsx";
import Disponibilidad from "./Disponibilidad.tsx";
import Servicios from "./Servicios.tsx";

const PESTANAS = [
  { a: "/proveedor", texto: "Servicios", icono: "🧰", fin: true },
  { a: "/proveedor/disponibilidad", texto: "Disponibilidad", icono: "📅", fin: false },
  { a: "/proveedor/cuenta", texto: "Cuenta", icono: "👤", fin: false },
];

function Avisos({ proveedor, protocolosVigentes }: { proveedor: Proveedor; protocolosVigentes: boolean }) {
  return (
    <div className="space-y-2">
      {proveedor.estado === "pendiente" && (
        <Mensaje tipo="nota">Tu cuenta está en revisión. Mientras tanto marca tu disponibilidad y lee los protocolos.</Mensaje>
      )}
      {!protocolosVigentes && (
        <Mensaje tipo="nota">
          Lee y acepta los protocolos de servicio para poder tomar servicios.{" "}
          <NavLink to="/proveedor/cuenta" className="font-bold underline">
            Ir a Cuenta
          </NavLink>
        </Mensaje>
      )}
    </div>
  );
}

/** Aplicación del proveedor. */
export default function ProveedorApp() {
  const { yo } = useSesion();
  if (yo?.tipo !== "proveedor") return <Cargando />;
  const { proveedor, protocolosVigentes } = yo;

  return (
    <div className="mx-auto min-h-screen max-w-2xl pb-24">
      <header className="px-4 pb-2 pt-5">
        <h1 className="text-2xl font-extrabold text-tinta">Hola, {proveedor.nombre.split(" ")[0]}</h1>
      </header>
      <main className="space-y-4 px-4">
        <Avisos proveedor={proveedor} protocolosVigentes={protocolosVigentes} />
        <Routes>
          <Route index element={<Servicios proveedor={proveedor} />} />
          <Route path="disponibilidad" element={<Disponibilidad />} />
          <Route path="cuenta" element={<Cuenta proveedor={proveedor} protocolosVigentes={protocolosVigentes} />} />
        </Routes>
      </main>
      <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-10 border-t border-linea bg-white">
        <ul className="mx-auto flex max-w-2xl">
          {PESTANAS.map((p) => (
            <li key={p.a} className="flex-1">
              <NavLink
                to={p.a}
                end={p.fin}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-2.5 text-xs font-bold ${isActive ? "text-marca" : "text-tenue"}`
                }
              >
                <span aria-hidden className="text-xl">
                  {p.icono}
                </span>
                {p.texto}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
