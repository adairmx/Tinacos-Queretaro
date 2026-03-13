import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, ArrowRight, Tag } from "lucide-react";
import type { BlogPost } from "@shared/schema";

interface FeaturedPostProps {
  post: BlogPost;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <Link to={`/blog/${post.slug}`}>
      <div className="group relative rounded-2xl overflow-hidden mb-12 hover:shadow-2xl transition-all duration-500 cursor-pointer border border-border/50 hover:border-primary/30">
        {/* Background Image */}
        <div className="relative h-[420px] md:h-[500px] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="space-y-4 max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-full shadow-lg">
                ⭐ Destacado
              </span>
              {post.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                  <Tag className="w-3 h-3" />
                  {post.category}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight group-hover:text-accent transition-colors duration-200">
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="text-gray-200 text-base md:text-lg line-clamp-2">
              {post.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-5 pt-2 text-sm text-gray-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              {post.readingTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.readingTime} min de lectura
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </div>
            </div>

            {/* CTA */}
            <Button className="mt-2 w-fit gap-2 bg-accent hover:bg-accent/90 text-white font-bold shadow-lg group/btn">
              Leer Artículo
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
