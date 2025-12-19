import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function Reviews() {
  const reviews = [
    {
      name: "María González",
      date: "Hace 2 semanas",
      rating: 5,
      text: "Excelente servicio, llegaron muy puntuales y dejaron mi tinaco impecable. El agua salía turbia y ahora está cristalina. Muy recomendados por su amabilidad y profesionalismo.",
      initial: "MG"
    },
    {
      name: "Roberto Martínez",
      date: "Hace 1 mes",
      rating: 5,
      text: "Contraté el paquete de tinaco y cisterna. Me sorprendió la cantidad de lodo que sacaron. El personal muy capacitado y respetuoso. Sin duda los volveré a llamar el próximo año.",
      initial: "RM"
    },
    {
      name: "Laura Sánchez",
      date: "Hace 3 semanas",
      rating: 5,
      text: "Rápidos y eficientes. Me gustó que usan equipo especial y no desperdician agua innecesariamente. El precio es justo por la calidad del trabajo. ¡Gracias!",
      initial: "LS"
    },
    {
      name: "Carlos Ruiz",
      date: "Hace 2 meses",
      rating: 5,
      text: "Había cotizado en varios lugares y ellos me dieron la mejor atención desde el WhatsApp. El servicio fue excelente, muy limpios y ordenados.",
      initial: "CR"
    },
    {
      name: "Ana P.",
      date: "Hace 1 semana",
      rating: 5,
      text: "Muy buen servicio en Juriquilla. Llegaron a tiempo, traían todo su equipo y terminaron rápido. Mi cisterna quedó como nueva.",
      initial: "AP"
    }
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" 
              alt="Google"
              className="w-8 h-8"
            />
            <span className="text-2xl font-bold text-slate-700">Reseñas</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-2xl text-slate-800">4.9</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-[#FBBC05] text-[#FBBC05]" />
              ))}
            </div>
            <span className="text-muted-foreground ml-2">(Más de 150 opiniones)</span>
          </div>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="h-full border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {review.initial}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-foreground">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" 
                        alt="Google"
                        className="w-5 h-5 opacity-50"
                      />
                    </div>
                    
                    <div className="flex mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-[#FBBC05] text-[#FBBC05]" />
                      ))}
                    </div>
                    
                    <p className="text-sm text-slate-600 leading-relaxed flex-grow">
                      "{review.text}"
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-12 border-primary text-primary hover:bg-primary hover:text-white" />
            <CarouselNext className="-right-12 border-primary text-primary hover:bg-primary hover:text-white" />
          </div>
        </Carousel>

        <div className="mt-12 text-center">
          <a 
            href="https://share.google/aUvxqU4DHnNax1cXE" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            Ver todas las opiniones en Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
