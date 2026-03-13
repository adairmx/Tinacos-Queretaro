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
import ReactMarkdown from "react-markdown";
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
                variant="ghost"
                size="sm"
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
                  components={{
                    p: ({ children }) => (
                      <p className="mb-6 leading-relaxed text-slate-700">{children}</p>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold mt-12 mb-5 text-primary">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-bold mt-8 mb-4 text-primary/80">
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-2 mb-6 text-slate-700">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-2 mb-6 text-slate-700">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">
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
                  variant="outline"
                  size="sm"
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
