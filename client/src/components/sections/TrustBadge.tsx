import { Star } from "lucide-react";

export default function TrustBadge() {
  return (
    <div className="flex flex-col items-center justify-center py-8 bg-white border-b border-border/50">
      <a 
        href="https://share.google/aUvxqU4DHnNax1cXE" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300"
      >
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-6 h-6 fill-[#FBBC05] text-[#FBBC05]" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-lg text-primary">
            ¡Somos los mejores en Google!
          </span>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" 
            alt="Google Logo"
            className="w-6 h-6"
            width="24"
            height="24"
            loading="lazy"
          />
        </div>
        <span className="text-sm text-muted-foreground group-hover:text-primary underline decoration-dotted">
          Ver opiniones de clientes satisfechos
        </span>
      </a>
    </div>
  );
}
