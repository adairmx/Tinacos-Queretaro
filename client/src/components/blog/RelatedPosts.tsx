import { useMemo } from "react";
import { BlogCard } from "./BlogCard";
import type { BlogPost } from "@shared/schema";

interface RelatedPostsProps {
  currentPost: BlogPost;
  allPosts: BlogPost[];
}

export function RelatedPosts({ currentPost, allPosts }: RelatedPostsProps) {
  const relatedPosts = useMemo(() => {
    // Prefer same category, fallback to other posts
    const sameCategory = allPosts.filter(
      (post) => post.category === currentPost.category && post.id !== currentPost.id
    );
    const others = allPosts.filter(
      (post) => post.category !== currentPost.category && post.id !== currentPost.id
    );
    return [...sameCategory, ...others].slice(0, 3);
  }, [currentPost, allPosts]);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-8">
        Artículos Relacionados
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {relatedPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
