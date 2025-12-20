import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import { useToast } from "@/hooks/use-toast";

export default function AdminBlog() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Artículo Publicado",
      description: "Tu artículo ha sido guardado exitosamente (Simulación).",
    });

    setIsLoading(false);
    setLocation("/blog");
  };

  return (
    <div className="min-h-screen bg-muted/10 font-sans">
      <Navbar />
      
      <main className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button variant="ghost" size="sm" className="mb-8 hover:text-primary -ml-4" asChild>
            <Link href="/blog">
              <a className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al Blog
              </a>
            </Link>
          </Button>

          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="mb-8">
              <h1 className="font-heading text-2xl font-bold text-primary mb-2">Crear Nuevo Artículo</h1>
              <p className="text-muted-foreground text-sm">
                Escribe un nuevo artículo para el blog de MonsterCo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Artículo</Label>
                <Input id="title" placeholder="Ej: 5 Tips para cuidar tu tinaco" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de la Imagen Principal</Label>
                <Input id="image" placeholder="https://..." />
                <p className="text-xs text-muted-foreground">Pega aquí el enlace a tu imagen.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumen (Excerpt)</Label>
                <Textarea id="excerpt" placeholder="Breve descripción que aparecerá en la lista..." rows={3} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido (Markdown soportado)</Label>
                <Textarea id="content" placeholder="Escribe aquí el contenido completo de tu artículo..." className="min-h-[300px] font-mono text-sm" required />
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/blog">Cancelar</Link>
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (
                    "Publicando..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Publicar Artículo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
