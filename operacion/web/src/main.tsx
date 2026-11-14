import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminApp from "./admin/AdminApp.tsx";
import "./estilos.css";
import ProveedorApp from "./proveedor/ProveedorApp.tsx";
import { EntrarComoAdmin, EntrarConAcceso, Inicio } from "./publico.tsx";
import { ProveedorDeSesion, useSesion } from "./sesion.tsx";
import { Cargando } from "./ui.tsx";

/** Deja pasar sólo a quien tiene sesión del tipo pedido; a los demás los manda a donde les toca entrar. */
function Solo({ tipo, children }: { tipo: "admin" | "proveedor"; children: ReactNode }) {
  const { yo } = useSesion();
  if (yo === undefined) return <Cargando />;
  if (yo?.tipo !== tipo) return <Navigate to={tipo === "admin" ? "/admin/entrar" : "/"} replace />;
  return children;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ProveedorDeSesion>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/entrar/:acceso" element={<EntrarConAcceso />} />
          <Route path="/admin/entrar" element={<EntrarComoAdmin />} />
          <Route path="/admin/*" element={<Solo tipo="admin"><AdminApp /></Solo>} />
          <Route path="/proveedor/*" element={<Solo tipo="proveedor"><ProveedorApp /></Solo>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProveedorDeSesion>
    </BrowserRouter>
  </StrictMode>,
);
