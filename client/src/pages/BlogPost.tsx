import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, Share2, ArrowLeft, Clock, Tag } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import NotFound from "@/pages/not-found";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import AuthorProfile from "@/components/blog/AuthorProfile";
import Comments from "@/components/blog/Comments";
import Newsletter from "@/components/blog/Newsletter";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import type { BlogPost as BlogPostType } from "@shared/schema";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    };
  }, [queryClient]);

  if (!slug) return <NotFound />;

  const { data: post, isLoading } = useQuery<BlogPostType>({
    queryKey: [`/api/blog/${slug}`],
    enabled: !!slug,
  });

  const { data: allPosts = [] } = useQuery<BlogPostType[]>({
    queryKey: ["/api/blog"],
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Dynamic SEO and Meta Tags
  useEffect(() => {
    if (post) {
      // Update Title
      document.title = `${post.title} | Lavado de Tinacos Querétaro`;
      
      // Update Meta Description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", post.excerpt || post.title);
      }

      // Update Open Graph tags
      const updateOgTag = (property: string, content: string) => {
        const tag = document.querySelector(`meta[property="${property}"]`);
        if (tag) tag.setAttribute("content", content);
      };

      updateOgTag("og:title", post.title);
      updateOgTag("og:description", post.excerpt || "");
      updateOgTag("og:url", window.location.href);
      updateOgTag("og:image", post.image || "https://lavadotinacos.com/opengraph.jpg");

      // Update Twitter tags
      const updateTwitterTag = (name: string, content: string) => {
        const tag = document.querySelector(`meta[name="${name}"]`);
        if (tag) tag.setAttribute("content", content);
      };

      updateTwitterTag("twitter:title", post.title);
      updateTwitterTag("twitter:description", post.excerpt || "");
      updateTwitterTag("twitter:image", post.image || "https://lavadotinacos.com/opengraph.jpg");

      // Structured Data (JSON-LD)
      const scriptId = "blog-post-json-ld";
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }

      const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": [post.image],
        "datePublished": post.createdAt || new Date().toISOString(),
        "author": [{
          "@type": "Person",
          "name": post.author,
          "url": "https://lavadotinacos.com/blog"
        }]
      };

      script.text = JSON.stringify(structuredData);

      return () => {
        // Reset or cleanup if needed when leaving page
        document.title = "Lavado de Tinacos en Querétaro | Limpieza y Desinfección Profesional";
        if (script) script.remove();
      };
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="w-full aspect-video rounded-2xl mb-8" />
            <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-5 w-48 mx-auto mb-12" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) return <NotFound />;

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6 max-w-5xl mx-auto">
            <Link to="/blog">
              <Button
                variant={"ghost" as any}
                size={"sm" as any}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al blog
              </Button>
            </Link>
          </div>

          {/* Main Layout: Article + TOC Sidebar */}
          <div className="max-w-5xl mx-auto xl:grid xl:grid-cols-[1fr_240px] xl:gap-12">
            <article>
              {/* Hero Image */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl mb-10">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Post Header */}
              <header className="mb-10 text-center">
                {/* Category */}
                {post.category && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                      <Tag className="w-3 h-3" />
                      {post.category}
                    </span>
                  </div>
                )}

                <h1 className="font-heading text-2xl md:text-4xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                  {post.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                  {post.readingTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {post.readingTime} min de lectura
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {post.author}
                  </div>
                </div>
              </header>

              {/* Content */}
              <div className="prose prose-lg prose-slate mx-auto max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-primary prose-a:text-accent prose-img:rounded-xl prose-p:leading-relaxed">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    p: ({ children, ...props }) => (
                      <p {...props} className="mb-6 leading-relaxed text-slate-700">{children}</p>
                    ),
                    h2: ({ children, ...props }) => (
                      <h2 {...props} className="text-2xl font-bold mt-12 mb-5 text-primary">
                        {children}
                      </h2>
                    ),
                    h3: ({ children, ...props }) => (
                      <h3 {...props} className="text-xl font-bold mt-8 mb-4 text-primary/80">
                        {children}
                      </h3>
                    ),
                    ul: ({ children, ...props }) => (
                      <ul {...props} className="list-disc list-inside space-y-2 mb-6 text-slate-700">
                        {children}
                      </ul>
                    ),
                    ol: ({ children, ...props }) => (
                      <ol {...props} className="list-decimal list-inside space-y-2 mb-6 text-slate-700">
                        {children}
                      </ol>
                    ),
                    li: ({ children, ...props }) => (
                      <li {...props} className="leading-relaxed">{children}</li>
                    ),
                    strong: ({ children, ...props }) => (
                      <strong {...props} className="font-bold text-foreground">{children}</strong>
                    ),
                    blockquote: ({ children, ...props }) => (
                      <blockquote {...props} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Footer Actions */}
              <div className="mt-12 pt-8 border-t border-border flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="font-bold text-foreground">¿Te fue útil este artículo?</span>
                  <p className="text-muted-foreground text-sm mt-1">
                    Compártelo con quien lo necesite.
                  </p>
                </div>
                <Button
                  variant={"outline" as any}
                  size={"sm" as any}
                  className="gap-2 hover:border-primary/50 hover:text-primary transition-colors"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </Button>
              </div>

              {/* Related Posts */}
              {allPosts.length > 1 && (
                <RelatedPosts currentPost={post} allPosts={allPosts} />
              )}
              
              <div className="mt-16 pt-12 border-t border-slate-100">
                <AuthorProfile />
              </div>

              <div className="mt-8">
                <Newsletter />
              </div>

              {/* Comments Section */}
              <div className="mt-16">
                <Comments postId={post.id} />
              </div>
            </article>

            {/* Table of Contents Sidebar */}
            <TableOfContents />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
