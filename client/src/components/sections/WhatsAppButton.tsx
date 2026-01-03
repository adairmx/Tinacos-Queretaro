import { Button } from "@/components/ui/button";

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
      <Button
        size="icon"
        className="h-16 w-16 rounded-full bg-[#25D366] hover:bg-[#128C7E] shadow-[0_4px_14px_rgba(37,211,102,0.5)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] hover:scale-110 transition-all duration-300 p-0"
        asChild
      >
        <a 
          href="https://wa.me/5214425016667?text=Hola,%20quiero%20cotizar%20mi%20servicio"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
            alt="WhatsApp"
            className="h-10 w-10"
            width="40"
            height="40"
            loading="lazy"
          />
        </a>
      </Button>
      <span className="absolute -top-10 right-0 bg-white px-3 py-1 rounded-lg shadow-lg text-xs font-bold text-foreground whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none animate-bounce hidden md:block">
        ¡Cotiza aquí!
      </span>
    </div>
  );
}
