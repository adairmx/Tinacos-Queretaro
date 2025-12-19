export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-heading font-bold text-xl mb-4">LavadoQro</h3>
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
        
        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} LavadoQro. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
