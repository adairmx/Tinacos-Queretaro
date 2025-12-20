import { Link } from "wouter";
import { initialPosts } from "@/data/blog";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, Plus } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export default function Blog() {
  // In a real app, this would come from a backend/database
  // For now we use the static data + any local storage data could be merged here
  const posts = initialPosts;

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-accent font-bold uppercase tracking-wider text-sm mb-2 block">Blog</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-6">
              Consejos para tu Hogar
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Aprende sobre el mantenimiento de tu tinaco, cisterna y consejos para ahorrar agua y cuidar tu salud.
            </p>
            <Button variant="outline" asChild>
              <Link href="/admin/blog">
                <a className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Escribir Artículo (Demo)
                </a>
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border/50 group flex flex-col h-full">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button variant="link" className="px-0 text-accent font-bold group-hover:translate-x-1 transition-transform p-0" asChild>
                    <Link href={`/blog/${post.slug}`}>
                      <a className="flex items-center">
                        Leer más <ArrowRight className="ml-1 w-4 h-4" />
                      </a>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
