import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { FeaturedPost } from "@/components/blog/FeaturedPost";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const { data: posts = [], isLoading, isFetching } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    refetchOnMount: "always",
  });

  const [filteredPosts, setFilteredPosts] = useState<BlogPost[] | null>(null);

  const handleFilter = useCallback((filtered: BlogPost[]) => {
    setFilteredPosts(filtered);
  }, []);

  // Featured post = first post
  const featuredPost = useMemo(() => (posts.length > 0 ? posts[0] : null), [posts]);

  // Grid posts = all except featured when not filtering
  const gridPosts = useMemo(() => {
    if (filteredPosts !== null) return filteredPosts;
    return posts.slice(1); // Skip featured post in normal view
  }, [filteredPosts, posts]);

  const isFiltering = filteredPosts !== null;

  if (isFetching && posts.length === 0) {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Skeleton className="h-4 w-24 mx-auto mb-4" />
              <Skeleton className="h-12 w-72 mx-auto mb-4" />
              <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
            </div>
            <Skeleton className="h-[420px] w-full rounded-2xl mb-12" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12 md:mb-16">
            <span className="text-accent font-bold uppercase tracking-widest text-xs mb-3 inline-block">
              📚 Blog
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Consejos para tu Hogar
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Aprende sobre el mantenimiento de tu tinaco, cisterna y consejos prácticos para ahorrar agua y cuidar tu salud.
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && !isLoading && !isFiltering && (
            <FeaturedPost post={featuredPost} />
          )}

          {/* Search & Filter */}
          {!isLoading && posts.length > 0 && (
            <BlogSearch posts={posts} onFilter={handleFilter} />
          )}

          {/* Blog Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : gridPosts.length === 0 && isFiltering ? (
            <div className="text-center py-20">
              <div className="mb-4 text-6xl">🔍</div>
              <p className="text-foreground text-xl font-semibold mb-2">
                No hay artículos que coincidan
              </p>
              <p className="text-muted-foreground">
                Intenta con otras palabras o categorías.
              </p>
            </div>
          ) : gridPosts.length === 0 && !isFiltering ? (
            <div className="text-center py-20">
              <div className="mb-4 text-6xl">✍️</div>
              <p className="text-muted-foreground text-lg">
                No hay artículos disponibles por el momento.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Results Count */}
          {!isLoading && !isFiltering && posts.length > 1 && (
            <div className="text-center mt-12">
              <p className="text-muted-foreground text-sm">
                Mostrando {gridPosts.length} artículo{gridPosts.length !== 1 ? "s" : ""} más
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
