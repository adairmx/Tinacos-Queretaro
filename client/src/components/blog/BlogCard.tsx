import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, User, ArrowRight, Clock, Tag } from "lucide-react";
import type { BlogPost } from "@shared/schema";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link to={`/blog/${post.slug}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 group flex flex-col h-full cursor-pointer hover:border-primary/30 hover:scale-[1.02] transform">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Category badge */}
          {post.category && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-md">
                <Tag className="w-3 h-3" />
                {post.category}
              </span>
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.date}
            </div>
            {post.readingTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readingTime} min
              </div>
            )}
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {post.author}
            </div>
          </div>
          <h3 className="font-heading font-bold text-xl text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {post.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-grow">
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </CardContent>

        <CardFooter className="pt-0">
          <span className="flex items-center gap-1 text-accent font-bold text-sm group-hover:gap-2 transition-all duration-200">
            Leer más <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
