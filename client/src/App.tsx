import { useEffect } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { vistaDePagina } from "@/lib/medicion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import AdminBlog from "@/pages/AdminBlog";
import AdminLeads from "@/pages/AdminLeads";
import CityPage from "@/pages/CityPage";
import Terminos from "@/pages/Terminos";

/** Manda una vista de página a Meta y Google en cada cambio de ruta (el sitio no recarga al navegar). */
function MedirVistas() {
  const { pathname } = useLocation();
  useEffect(() => vistaDePagina(pathname), [pathname]);
  return null;
}

function CityDirectWrapper({ citySlug }: { citySlug: string }) {
  return <CityPage />;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <MedirVistas />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/terminos" element={<Terminos />} />
            
            {/* Rutas SEO Local por Metrópoli */}
            <Route path="/queretaro" element={<Navigate to="/" replace />} />
            <Route path="/ciudades/:citySlug" element={<CityPage />} />
            <Route path="/cdmx" element={<CityPage />} />
            <Route path="/edomex" element={<CityPage />} />
            <Route path="/guadalajara" element={<CityPage />} />
            <Route path="/monterrey" element={<CityPage />} />
            <Route path="/puebla" element={<CityPage />} />
            <Route path="/toluca" element={<CityPage />} />
            <Route path="/cuernavaca" element={<CityPage />} />
            <Route path="/leon" element={<CityPage />} />
            <Route path="/merida" element={<CityPage />} />
            <Route path="/san-luis-potosi" element={<CityPage />} />
            <Route path="/aguascalientes" element={<CityPage />} />
            <Route path="/cancun" element={<CityPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
