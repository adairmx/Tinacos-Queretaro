import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Share2, Clock, ChevronRight } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import CitySuggestion from "@/components/CitySuggestion";
import Footer from "@/components/sections/Footer";
import NotFound from "@/pages/not-found";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import AuthorProfile from "@/components/blog/AuthorProfile";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { AvisoEnArticulo, BarraCelular, Paquetes, TarjetaServicio } from "@/components/blog/ServiceCta";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { absoluteUrl, SITE_NAME, SITE_URL, useSeo } from "@/hooks/use-seo";
import { onCoverError } from "@/lib/coverImage";
import { splitArticle } from "@/lib/splitArticle";
import type { BlogPost as BlogPostType } from "@shared/schema";

const markdownComponents: Components = {
  // El título ya va en el encabezado: un # dentro del texto se pinta como subtítulo.
  h1: ({ node, children, ...props }) => (
    <h2 {...props} className="mb-4 mt-2 font-heading text-2xl font-bold leading-snug text-slate-900 md:text-[28px]">
      {children}
    </h2>
  ),
  p:({ node, children, ...props }) => (
    <p {...props} className="mb-6 text-[17px] leading-8 text-slate-700">
      {children}
    </p>
  ),
  h2: ({ node, children, ...props }) => (
    <h2
      {...props}
      className="mb-4 mt-12 scroll-mt-24 border-l-4 border-accent pl-4 font-heading text-2xl font-bold leading-snug text-slate-900 md:text-[28px]"
    >
      {children}
    </h2>
  ),
  h3: ({ node, children, ...props }) => (
    <h3 {...props} className="mb-3 mt-8 scroll-mt-24 font-heading text-xl font-bold text-slate-900">
      {children}
    </h3>
  ),
  ul: ({ node, children, ...props }) => (
    <ul {...props} className="mb-6 list-disc space-y-2 pl-6 text-[17px] leading-8 text-slate-700 marker:text-primary">
      {children}
    </ul>
  ),
  ol: ({ node, children, ...props }) => (
    <ol {...props} className="mb-6 list-decimal space-y-2 pl-6 text-[17px] leading-8 text-slate-700 marker:font-bold marker:text-primary">
      {children}
    </ol>
  ),
  li: ({ node, children, ...props }) => (
    <li {...props} className="pl-1">
      {children}
    </li>
  ),
  strong: ({ node, children, ...props }) => (
    <strong {...props} className="font-bold text-slate-900">
      {children}
    </strong>
  ),
  a: ({ node, children, ...props }) => (
    <a {...props} className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">
      {children}
    </a>
  ),
  img: ({ node, ...props }) => <img {...props} loading="lazy" className="my-8 w-full rounded-2xl shadow-md" />,
  blockquote: ({ node, children, ...props }) => (
    <blockquote {...props} className="my-8 rounded-r-2xl border-l-4 border-primary bg-sky-50 px-5 py-4 text-slate-700 [&>p]:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-slate-200" />,
};

const Markdown = ({ texto }: { texto: string }) => <ReactMarkdown components={markdownComponents}>{texto}</ReactMarkdown>;

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

  // El aviso del servicio va en el primer corte del artículo (donde antes iba un anuncio).
  const [inicio, ...resto] = useMemo(
    () => (post?.content ? splitArticle(post.content).filter(Boolean) : []),
    [post?.content],
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, text: post?.excerpt, url: window.location.href }).catch(() => undefined);
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
      <div className="flex min-h-screen flex-col bg-background font-sans">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container mx-auto max-w-6xl px-4">
            <Skeleton className="mb-4 h-4 w-40" />
            <Skeleton className="mb-4 h-12 w-3/4" />
            <Skeleton className="mb-10 h-5 w-1/2" />
            <Skeleton className="mb-8 aspect-video w-full max-w-3xl rounded-2xl" />
            <div className="max-w-3xl space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) return <NotFound />;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <ReadingProgress />
      <Navbar />
      <CitySuggestion />

      <main className="flex-1 pb-24 lg:pb-0">
        {/* Encabezado */}
        <header className="border-b border-slate-100 bg-gradient-to-b from-sky-50/80 to-background">
          <div className="container mx-auto max-w-6xl px-4 pb-8 pt-8 md:pb-10 md:pt-12">
            <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500" aria-label="Ruta">
              <Link to="/blog" className="font-medium hover:text-primary">
                Blog
              </Link>
              {post.category && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span>{post.category}</span>
                </>
              )}
            </nav>
            <div className="max-w-3xl">
              <h1 className="font-heading text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 md:text-5xl">
                {post.title}
              </h1>
              {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-slate-600 md:text-xl">{post.excerpt}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-2 font-semibold text-slate-700">
                  <img src="/favicon.png" alt="" className="h-7 w-7 rounded-full bg-white object-contain p-0.5 shadow-sm" />
                  Equipo técnico MonsterCo
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {post.date}
                </span>
                {post.readingTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {post.readingTime} min de lectura
                  </span>
                )}
                <button type="button" onClick={handleShare} className="flex items-center gap-1.5 font-medium hover:text-primary">
                  <Share2 className="h-4 w-4" /> Compartir
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Artículo + columna lateral */}
        <div className="container mx-auto max-w-6xl px-4 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
          <article className="min-w-0 max-w-3xl">
            <div className="mb-10 aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
              <img
                src={post.image}
                alt={post.title}
                width={1200}
                height={675}
                fetchPriority="high"
                onError={onCoverError}
                className="h-full w-full object-cover"
              />
            </div>

            <TableOfContents variant="movil" />

            {inicio && <Markdown texto={inicio} />}
            <AvisoEnArticulo titulo={post.title} />
            {resto.map((parte, i) => (
              <Markdown key={i} texto={parte} />
            ))}

            <div className="mt-14">
              <Paquetes titulo={post.title} />
            </div>

            <div className="mt-12">
              <AuthorProfile />
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <TarjetaServicio titulo={post.title} />
              <TableOfContents />
            </div>
          </aside>
        </div>

        {allPosts.length > 1 && (
          <div className="border-t border-slate-100 bg-slate-50/60">
            <div className="container mx-auto max-w-6xl px-4 py-14">
              <RelatedPosts currentPost={post} allPosts={allPosts} />
            </div>
          </div>
        )}
      </main>

      <BarraCelular titulo={post.title} />
      <Footer />
    </div>
  );
}
