import { NavLink, Route, Routes } from "react-router-dom";
import { api } from "../api.ts";
import { useSesion } from "../sesion.tsx";
import { Boton, useDatos } from "../ui.tsx";
import { Agendar } from "./Agendar.tsx";
import { Avisos } from "./Avisos.tsx";
import { Cuentas } from "./Cuentas.tsx";
import { Proveedores } from "./Proveedores.tsx";
import { Servicios } from "./Servicios.tsx";

export default function AdminApp() {
  const { salir } = useSesion();
  const avisos = useDatos(api.avisos, 20);
  const pendientes = avisos.datos?.filter((aviso) => aviso.estado === "pendiente").length ?? 0;

  const pestanas = [
    { a: "/admin", texto: "Agendar" },
    { a: "/admin/servicios", texto: "Servicios" },
    { a: "/admin/avisos", texto: "Avisos", burbuja: pendientes },
    { a: "/admin/proveedores", texto: "Proveedores" },
    { a: "/admin/cuentas", texto: "Cuentas" },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-linea bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-3">
          <h1 className="text-lg font-bold text-marca-fuerte">MonsterCo · Operación</h1>
          <Boton tono="claro" chico onClick={() => void salir()}>
            Salir
          </Boton>
        </div>
        <nav aria-label="Secciones" className="mx-auto flex max-w-[1100px] gap-1 overflow-x-auto px-4">
          {pestanas.map((pestana) => (
            <NavLink
              key={pestana.a}
              to={pestana.a}
              end
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold ${isActive ? "border-marca text-marca" : "border-transparent text-tenue hover:text-tinta"}`
              }
            >
              {pestana.texto}
              {pestana.burbuja ? <span className="rounded-full bg-acento px-2 py-0.5 text-xs font-bold text-white">{pestana.burbuja}</span> : null}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[1100px] px-4 py-5">
        <Routes>
          <Route index element={<Agendar />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="avisos" element={<Avisos {...avisos} />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="cuentas" element={<Cuentas />} />
        </Routes>
      </main>
    </div>
  );
}
