import { useQuery } from "@tanstack/react-query";
import type { SiteSettings } from "@shared/schema";

export default function Footer() {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const siteTitle = settings?.title || "MonsterCo";

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-brand font-black text-3xl mb-4 tracking-wide text-black" style={{ WebkitTextStroke: "1.5px hsl(var(--primary))" }}>
              {siteTitle}
            </h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Servicio profesional de limpieza y desinfección de sistemas de almacenamiento de agua en Querétaro.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Servicios</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#services" className="hover:text-white transition-colors">Lavado de Tinacos</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Lavado de Cisternas</a></li>
              <li><a href="#zones" className="hover:text-white transition-colors">Zonas de Cobertura</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Querétaro, Qro. México</li>
              <li>Tel: 442 501 6667</li>
              <li>lavadodetinacosqueretaro@gmail.com</li>
            </ul>
          </div>
        </div>
        
        {/* Enlaces de Cobertura Nacional para SEO Local e Interlinking */}
        <div className="border-t border-slate-800/80 pt-6 pb-2 text-xs text-slate-400">
          <span className="font-bold text-slate-300 block mb-2 uppercase tracking-wider text-[11px]">
            Cobertura Nacional de Lavado de Tinacos y Cisternas:
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <a href="/" className="hover:text-white transition-colors">Querétaro</a>
            <span className="text-slate-600">•</span>
            <a href="/cdmx" className="hover:text-white transition-colors">CDMX</a>
            <span className="text-slate-600">•</span>
            <a href="/edomex" className="hover:text-white transition-colors">Edomex</a>
            <span className="text-slate-600">•</span>
            <a href="/guadalajara" className="hover:text-white transition-colors">Guadalajara y Zapopan</a>
            <span className="text-slate-600">•</span>
            <a href="/monterrey" className="hover:text-white transition-colors">Monterrey</a>
            <span className="text-slate-600">•</span>
            <a href="/puebla" className="hover:text-white transition-colors">Puebla y Cholula</a>
            <span className="text-slate-600">•</span>
            <a href="/toluca" className="hover:text-white transition-colors">Toluca y Metepec</a>
            <span className="text-slate-600">•</span>
            <a href="/cuernavaca" className="hover:text-white transition-colors">Cuernavaca</a>
            <span className="text-slate-600">•</span>
            <a href="/leon" className="hover:text-white transition-colors">León</a>
            <span className="text-slate-600">•</span>
            <a href="/merida" className="hover:text-white transition-colors">Mérida</a>
            <span className="text-slate-600">•</span>
            <a href="/san-luis-potosi" className="hover:text-white transition-colors">San Luis Potosí</a>
            <span className="text-slate-600">•</span>
            <a href="/aguascalientes" className="hover:text-white transition-colors">Aguascalientes</a>
            <span className="text-slate-600">•</span>
            <a href="/cancun" className="hover:text-white transition-colors">Cancún</a>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-6 pt-6 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {siteTitle}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
