import { useRoute, Link } from "wouter";
import { initialPosts } from "@/data/blog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import NotFound from "@/pages/not-found";
import ReactMarkdown from 'react-markdown';

export default function BlogPost() {
  const [match, params] = useRoute("/blog/:slug");
  
  if (!match) return <NotFound />;

  const post = initialPosts.find(p => p.slug === params.slug);

  if (!post) return <NotFound />;

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      <main className="py-20">
        <article className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" size="sm" className="mb-8 hover:text-primary -ml-4" asChild>
            <Link href="/blog">
              <a className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al Blog
              </a>
            </Link>
          </Button>

          <header className="mb-10 text-center">
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
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

            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl mb-10">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </header>

          <div className="prose prose-lg prose-slate mx-auto max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-primary prose-a:text-accent prose-img:rounded-xl">
            <ReactMarkdown>{post.content}</ReactMarkdown>
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
