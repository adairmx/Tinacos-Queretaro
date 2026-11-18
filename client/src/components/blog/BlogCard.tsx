import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { onCoverError } from "@/lib/coverImage";
import type { BlogPost } from "@shared/schema";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={post.image}
          alt={post.title}
          width={640}
          height={400}
          loading="lazy"
          onError={onCoverError}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {post.category && post.category !== "General" && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary shadow-sm">
            {post.category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            {post.readingTime ? (
              <>
                <Clock className="h-3.5 w-3.5" /> {post.readingTime} min
              </>
            ) : (
              post.date
            )}
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-accent">
            Leer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
