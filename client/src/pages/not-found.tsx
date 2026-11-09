import { Link } from "react-router-dom";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/use-seo";

export default function NotFound() {
  useSeo({ title: "Página no encontrada | MonsterCo", noindex: true });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <Droplets className="h-12 w-12 text-primary mb-5" aria-hidden="true" />
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
        Esta página se fue por el desagüe
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        No encontramos lo que buscabas. Puede que el enlace haya cambiado o ya no exista.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild>
          <Link to="/">Ir al inicio</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/blog">Ver el blog</Link>
        </Button>
      </div>
    </main>
  );
}
