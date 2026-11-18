import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { onCoverError } from "@/lib/coverImage";
import type { BlogPost } from "@shared/schema";

export function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 md:aspect-auto md:min-h-[340px]">
        <img
          src={post.image}
          alt={post.title}
          onError={onCoverError}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col justify-center p-6 md:p-10">
        <span className="w-fit rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
          Lo más reciente
        </span>
        <h2 className="mt-4 font-heading text-2xl font-extrabold leading-tight text-slate-900 transition-colors group-hover:text-primary md:text-3xl">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-base leading-relaxed text-slate-600">{post.excerpt}</p>
        <div className="mt-6 flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-2 font-bold text-primary">
            Leer guía <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
          {post.readingTime && (
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="h-4 w-4" /> {post.readingTime} min
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
