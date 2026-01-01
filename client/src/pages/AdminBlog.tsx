import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import type { InsertBlogPost } from "@shared/schema";

export default function AdminBlog() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuth(true);
      toast({
        title: "Sesión iniciada",
        description: "Bienvenido al panel de administración.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Contraseña incorrecta.",
      });
    }
  };

  const createPostMutation = useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({
        title: "Artículo Publicado",
        description: "Tu artículo ha sido guardado exitosamente.",
      });
      setLocation("/blog");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo publicar el artículo.",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const title = formData.get("title") as string;
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const postData: InsertBlogPost = {
      title,
      slug,
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      image: formData.get("image") as string || "/placeholder-blog.jpg",
      author: "MonsterCo",
      date: new Date().toLocaleDateString("es-MX", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
      }),
    };

    createPostMutation.mutate(postData);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-muted/10 font-sans flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Admin Login</CardTitle>
            <CardDescription>Ingresa tu contraseña para acceder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 font-sans">
      <Navbar />
      
      <main className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
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
                <Input id="title" name="title" placeholder="Ej: 5 Tips para cuidar tu tinaco" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de la Imagen Principal</Label>
                <Input id="image" name="image" placeholder="https://..." />
                <p className="text-xs text-muted-foreground">Pega aquí el enlace a tu imagen.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumen (Excerpt)</Label>
                <Textarea id="excerpt" name="excerpt" placeholder="Breve descripción que aparecerá en la lista..." rows={3} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido (Markdown soportado)</Label>
                <Textarea id="content" name="content" placeholder="Escribe aquí el contenido completo de tu artículo..." className="min-h-[300px] font-mono text-sm" required />
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/blog">Cancelar</Link>
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={createPostMutation.isPending}>
                  {createPostMutation.isPending ? (
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
