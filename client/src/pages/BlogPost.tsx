import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, Share2, ArrowLeft, Clock, Tag, MessageCircle, PhoneCall, ShieldCheck, Check } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import CitySuggestion from "@/components/CitySuggestion";
import Footer from "@/components/sections/Footer";
import NotFound from "@/pages/not-found";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import AuthorProfile from "@/components/blog/AuthorProfile";
import Comments from "@/components/blog/Comments";
import Newsletter from "@/components/blog/Newsletter";
import AdSenseBanner, { AD_SLOTS } from "@/components/blog/AdSenseBanner";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { absoluteUrl, SITE_NAME, SITE_URL, useSeo } from "@/hooks/use-seo";
import { onCoverError } from "@/lib/coverImage";
import { splitArticle } from "@/lib/splitArticle";
import type { BlogPost as BlogPostType } from "@shared/schema";

const markdownComponents: Components = {
  p: ({ node, children, ...props }) => (
    <p {...props} className="mb-6 leading-relaxed text-slate-700">{children}</p>
  ),
  h2: ({ node, children, ...props }) => (
    <h2 {...props} className="text-2xl font-bold mt-12 mb-5 text-primary">{children}</h2>
  ),
  h3: ({ node, children, ...props }) => (
    <h3 {...props} className="text-xl font-bold mt-8 mb-4 text-primary/80">{children}</h3>
  ),
  ul: ({ node, children, ...props }) => (
    <ul {...props} className="list-disc pl-6 space-y-2 mb-6 text-slate-700">{children}</ul>
  ),
  ol: ({ node, children, ...props }) => (
    <ol {...props} className="list-decimal pl-6 space-y-2 mb-6 text-slate-700">{children}</ol>
  ),
  li: ({ node, children, ...props }) => (
    <li {...props} className="leading-relaxed">{children}</li>
  ),
  strong: ({ node, children, ...props }) => (
    <strong {...props} className="font-bold text-foreground">{children}</strong>
  ),
  blockquote: ({ node, children, ...props }) => (
    <blockquote {...props} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">
      {children}
    </blockquote>
  ),
};

const articleSlots = [AD_SLOTS.article1, AD_SLOTS.article2, AD_SLOTS.article3];

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    };
  }, [queryClient]);

  const { data: post, isLoading } = useQuery<BlogPostType>({
    queryKey: [`/api/blog/${slug}`],
    enabled: !!slug,
  });

  const { data: allPosts = [] } = useQuery<BlogPostType[]>({
    queryKey: ["/api/blog"],
  });

  const articleParts = useMemo(
    () => (post?.content ? splitArticle(post.content).filter(Boolean) : []),
    [post?.content],
  );

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

  useSeo({
    title: post ? `${post.title} | MonsterCo` : undefined,
    description: post?.excerpt,
    path: slug ? `/blog/${slug}` : undefined,
    image: post?.image,
    type: "article",
    jsonLd: post
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
          headline: post.title,
          description: post.excerpt,
          image: [absoluteUrl(post.image)],
          datePublished: post.createdAt,
          author: { "@type": "Organization", name: post.author },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
          },
        }
      : undefined,
  });

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

      <CitySuggestion />

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
                  width={1200}
                  height={675}
                  fetchPriority="high"
                  onError={onCoverError}
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
                {articleParts.map((part, index) => (
                  <section key={index}>
                    <ReactMarkdown components={markdownComponents}>{part}</ReactMarkdown>
                    <AdSenseBanner slot={articleSlots[index]} />
                  </section>
                ))}
              </div>

              {/* Call to Action Banner de Conversión Directa */}
              <div className="my-12 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/20 shadow-lg text-center relative overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold mb-4 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Servicio Profesional Garantizado
                </div>

                <h3 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground mb-3 leading-snug">
                  ¿Prefieres que un profesional capacitado limpie tu tinaco o cisterna?
                </h3>

                <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-6 leading-relaxed">
                  Evita riesgos de subir a la azotea o ingresar a espacios confinados. Contamos con cuadrillas con hidrolavadora a presión, bombas de achique y desinfección bactericida en las principales ciudades de México.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto mb-4">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-12 px-6 rounded-xl shadow-md text-base"
                    asChild
                  >
                    <a
                      href={`https://wa.me/5214425016667?text=${encodeURIComponent(
                        `Hola, leí su artículo en el blog sobre "${post.title}" y me gustaría cotizar el servicio para mi domicilio.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="w-5 h-5 mr-2 fill-current" />
                      Cotizar por WhatsApp
                    </a>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto font-bold h-12 px-6 rounded-xl border-primary text-primary hover:bg-primary/5"
                    asChild
                  >
                    <a href="tel:+524425016667">
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Llamar Directo
                    </a>
                  </Button>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-muted-foreground pt-2">
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-500" /> Cero anticipos</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-500" /> Precios fijos transparentes</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-500" /> Pago contra entrega</span>
                </div>
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
