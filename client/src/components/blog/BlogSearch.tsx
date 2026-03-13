import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { BlogPost } from "@shared/schema";

interface BlogSearchProps {
  posts: BlogPost[];
  onFilter: (filtered: BlogPost[]) => void;
}

export function BlogSearch({ posts, onFilter }: BlogSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));
    return (cats as string[]).sort();
  }, [posts]);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  // Call parent handler whenever filters change
  useEffect(() => {
    onFilter(filteredPosts);
  }, [filteredPosts, onFilter]);

  const handleClear = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  const isFiltering = searchQuery !== "" || selectedCategory !== null;

  return (
    <div className="space-y-4 mb-8">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar artículos por título, tema o contenido..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 border-2 border-border/50 focus:border-primary/50 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSelectedCategory(selectedCategory === category ? null : category)
              }
              className={`transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "hover:border-primary/50"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {/* Results Summary & Clear Button */}
      {isFiltering && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-sm text-muted-foreground">
            {filteredPosts.length} de {posts.length} artículos encontrados
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
            Limpiar
          </Button>
        </div>
      )}
    </div>
  );
}
