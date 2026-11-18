import { useMemo } from "react";
import { BlogCard } from "./BlogCard";
import type { BlogPost } from "@shared/schema";

interface RelatedPostsProps {
  currentPost: BlogPost;
  allPosts: BlogPost[];
}

export function RelatedPosts({ currentPost, allPosts }: RelatedPostsProps) {
  const relatedPosts = useMemo(() => {
    const sameCategory = allPosts.filter((p) => p.category === currentPost.category && p.id !== currentPost.id);
    const others = allPosts.filter((p) => p.category !== currentPost.category && p.id !== currentPost.id);
    return [...sameCategory, ...others].slice(0, 3);
  }, [currentPost, allPosts]);

  if (relatedPosts.length === 0) return null;

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-widest text-accent">Sigue leyendo</p>
      <h2 className="mb-8 mt-1 font-heading text-2xl font-bold text-slate-900 md:text-3xl">Artículos relacionados</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
