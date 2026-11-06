import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileActionFooterProps {
  phoneNumber?: string;
  whatsappNumber?: string;
}

export default function MobileActionFooter({
  phoneNumber = "+524425016667",
  whatsappNumber = "5214425016667"
}: MobileActionFooterProps) {
  const defaultWhatsAppMsg = encodeURIComponent(
    "Hola, vi su sitio web de lavado de tinacos y cisternas. Me gustaría cotizar un servicio para mi domicilio."
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border p-2.5 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden flex items-center gap-3">
      <Button
        variant="outline"
        size="lg"
        className="flex-1 font-bold border-primary text-primary hover:bg-primary/10 flex items-center justify-center gap-2 h-12 rounded-xl text-base"
        asChild
      >
        <a href={`tel:${phoneNumber}`} aria-label="Llamar por teléfono">
          <Phone className="h-5 w-5 fill-current" />
          <span>Llamar</span>
        </a>
      </Button>

      <Button
        size="lg"
        className="flex-1 font-bold bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center justify-center gap-2 h-12 rounded-xl shadow-md text-base"
        asChild
      >
        <a
          href={`https://wa.me/${whatsappNumber}?text=${defaultWhatsAppMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Cotizar por WhatsApp"
        >
          <MessageCircle className="h-5 w-5 fill-current" />
          <span>WhatsApp</span>
        </a>
      </Button>
    </div>
  );
}

