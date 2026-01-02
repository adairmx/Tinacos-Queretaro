import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Calendar, User, Share2 } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import NotFound from "@/pages/not-found";
import ReactMarkdown from "react-markdown";
import type { BlogPost as BlogPostType } from "@shared/schema";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Si por alguna razón slug llega a ser "blog" (caso de mismatch al volver),
  // redirigimos a /blog para evitar la pantalla en blanco.
  useEffect(() => {
    if (slug === "blog") {
      navigate("/blog", { replace: true });
    }
  }, [slug, navigate]);

  // Invalidar la lista de posts cuando se desmonta este componente (al volver al listado)
  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    };
  }, [queryClient]);

  // Si estamos en el proceso de redirección por el caso 'blog', devolvemos null para evitar flash
  if (slug === "blog") return null;
  if (!slug) return <NotFound />;

  const { data: post, isLoading } = useQuery<BlogPostType>({
    queryKey: [`/api/blog/${slug}`],
    enabled: !!slug && slug !== "blog",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <main className="py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">Cargando artículo...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) return <NotFound />;

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <main className="py-20">
        <article className="container mx-auto px-4 max-w-3xl">
          <header className="mb-10 text-center">
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl mb-10">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>

            <h1 className="font-heading text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight">
              {post.title}
            </h1>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </div>
            </div>
          </header>

          <div className="prose prose-lg prose-slate mx-auto max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-primary prose-a:text-accent prose-img:rounded-xl prose-p:mb-8 prose-p:leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-8 leading-relaxed text-slate-700">{children}</p>,
                h2: ({ children }) => <h2 className="text-2xl font-bold mt-12 mb-6 text-primary">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-bold mt-10 mb-4 text-primary">{children}</h3>,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
            <span className="font-bold text-foreground">¿Te fue útil este artículo?</span>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Compartir
            </Button>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
