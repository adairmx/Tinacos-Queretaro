import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Settings, FileText, Tag, Search, Plus,
  Trash2, Eye, ExternalLink, MoreVertical,
  RefreshCw, Image as ImageIcon, LogOut, LayoutDashboard,
  ChevronRight, Clock, AlertTriangle, User as UserIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import type { BlogPost, InsertBlogPost, Author, SiteSettings } from "@shared/schema";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const CATEGORIES = ["General", "Mantenimiento", "Ahorro de Agua", "Salud", "Consejos", "Instalaciones"];

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function wordCount(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const { toast } = useToast();
  const [pw, setPw] = useState("");

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === "admin123") {
      onLogin();
    } else {
      toast({ variant: "destructive", title: "Contraseña incorrecta" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-[#18181b] border-white/10 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-white text-xl">Content Manager</CardTitle>
          <CardDescription className="text-white/50">Panel de administración del blog</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handle} className="space-y-4">
            <Input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Contraseña"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              autoFocus
              required
            />
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Nav Section Item ─────────────────────────────────────────────────────────
function NavItem({
  icon: Icon, label, active, onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group ${
        active
          ? "bg-primary/20 text-primary font-semibold"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${active ? "opacity-100" : ""}`} />
    </button>
  );
}

// ─── Post Row (middle column) ─────────────────────────────────────────────────
function PostRow({
  post, selected, onClick,
}: {
  post: BlogPost;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors border-b border-white/5 group ${
        selected
          ? "bg-primary/10 border-l-2 border-l-primary"
          : "hover:bg-white/5"
      }`}
    >
      {post.image ? (
        <img
          src={post.image}
          alt={post.title}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-white/10"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <ImageIcon className="w-4 h-4 text-white/30" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${selected ? "text-white" : "text-white/80"}`}>
          {post.title}
        </p>
        <p className="text-xs text-white/40 mt-0.5 truncate">
          {post.category || "General"} · {post.date}
        </p>
      </div>
    </button>
  );
}

// ─── Edit Panel (right column) ────────────────────────────────────────────────
interface EditPanelProps {
  post?: BlogPost;
  isNew: boolean;
  onSaved: (post: BlogPost) => void;
  onDeleted: () => void;
}

type PanelTab = "editor" | "preview";

function EditPanel({ post, isNew, onSaved, onDeleted }: EditPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [image, setImage] = useState(post?.image ?? "");
  const [category, setCategory] = useState(post?.category ?? "General");
  const [tab, setTab] = useState<PanelTab>("editor");
  const [deletingConfirm, setDeletingConfirm] = useState(false);

  // Sync when post changes
  useEffect(() => {
    setTitle(post?.title ?? "");
    setSlug(post?.slug ?? "");
    setExcerpt(post?.excerpt ?? "");
    setContent(post?.content ?? "");
    setImage(post?.image ?? "");
    setCategory(post?.category ?? "General");
    setTab("editor");
    setDeletingConfirm(false);
  }, [post?.id, isNew]);

  const words = wordCount(content);
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const generateSlug = () => setSlug(toSlug(title));

  const postData: InsertBlogPost = useMemo(() => ({
    title,
    slug: slug || toSlug(title),
    excerpt,
    content,
    image: image || "/placeholder-blog.jpg",
    author: "MonsterCo",
    category,
    readingTime,
    date: post?.date ?? new Date().toLocaleDateString("es-MX", {
      day: "2-digit", month: "short", year: "numeric",
    }),
  }), [title, slug, excerpt, content, image, category, readingTime, post]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = isNew ? "/api/blog" : `/api/blog/${post!.id}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.message || errorData.error || "Error al guardar";
        const diagnostic = errorData.error && errorData.message ? `${errorData.error}: ${errorData.message}` : msg;
        throw new Error(diagnostic);
      }
      return res.json() as Promise<BlogPost>;
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: isNew ? "✅ Artículo publicado" : "✅ Cambios guardados" });
      onSaved(saved);
    },
    onError: (error: Error) => {
      console.error("Save Error:", error);
      toast({ 
        variant: "destructive", 
        title: "Error al guardar",
        description: error.message 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/blog/${post!.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "🗑️ Artículo eliminado" });
      onDeleted();
    },
    onError: () => toast({ variant: "destructive", title: "Error al eliminar" }),
  });

  const isEmpty = !title.trim();

  return (
    <div className="flex flex-col h-full">
      {/* Panel Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 flex-shrink-0">
        <h2 className="text-white font-semibold text-sm truncate max-w-[60%]">
          {title || (isNew ? "Nuevo artículo" : "Sin título")}
        </h2>
        <div className="flex items-center gap-1">
          {/* Tab toggle */}
          <div className="flex bg-white/5 rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setTab("editor")}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${tab === "editor" ? "bg-white/15 text-white" : "text-white/40 hover:text-white"}`}
            >
              Editor
            </button>
            <button
              onClick={() => setTab("preview")}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${tab === "preview" ? "bg-white/15 text-white" : "text-white/40 hover:text-white"}`}
            >
              Preview
            </button>
          </div>

          {!isNew && (
            <Link to={`/blog/${post?.slug}`} target="_blank">
              <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </Link>
          )}

          {!isNew && (
            <button
              onClick={() => {
                if (deletingConfirm) deleteMutation.mutate();
                else setDeletingConfirm(true);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                deletingConfirm
                  ? "text-red-400 bg-red-500/20 hover:bg-red-500/30"
                  : "text-white/40 hover:text-red-400 hover:bg-white/10"
              }`}
              title={deletingConfirm ? "Click para confirmar" : "Eliminar"}
            >
              {deletingConfirm ? <AlertTriangle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Panel Body — EDITOR or PREVIEW */}
      <div className="flex-1 overflow-y-auto">
        {tab === "editor" ? (
          <div className="p-5 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Título</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Escribe el título aquí..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-primary/60 focus:bg-white/8 transition-colors"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Slug</label>
              <div className="flex gap-2">
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-del-articulo"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70 text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/8 border border-white/10 text-white/60 text-xs hover:text-white hover:bg-white/15 transition-colors whitespace-nowrap"
                >
                  <RefreshCw className="w-3 h-3" />
                  Generar
                </button>
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Resumen
                <span className="ml-2 text-white/30 font-normal normal-case">
                  Se muestra en el listado del blog y en buscadores
                </span>
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Breve descripción del artículo..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/80 text-sm placeholder:text-white/25 focus:outline-none focus:border-primary/60 transition-colors resize-none"
              />
              <p className="text-xs text-white/30">{excerpt.length} caracteres</p>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/80 text-sm focus:outline-none focus:border-primary/60 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#1c1c1f] text-white">{c}</option>
                ))}
              </select>
            </div>

            {/* Main Image */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Imagen Principal</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/80 text-sm font-mono placeholder:text-white/25 focus:outline-none focus:border-primary/60 transition-colors"
              />
              {image && (
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/10 mt-2">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center justify-between">
                <span>Contenido <span className="font-normal normal-case text-white/30">(Markdown)</span></span>
                <span className="text-white/30">{words} palabras · {readingTime} min</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`## Título de sección\n\nEscribe aquí el contenido...\n\n### Subsección\n\n- Punto 1\n- Punto 2\n\n**Texto en negritas**`}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-white/80 text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors resize-y min-h-[300px] leading-relaxed"
              />
            </div>
          </div>
        ) : (
          /* Preview Tab */
          <div className="p-5">
            {image && (
              <div className="w-full h-52 rounded-xl overflow-hidden mb-6 border border-white/10">
                <img src={image} alt={title} className="w-full h-full object-cover" />
              </div>
            )}
            <Badge className="text-xs mb-3 border-primary/40 text-primary">{category}</Badge>
            <h1 className="text-white text-2xl font-bold font-heading mb-2 leading-tight">{title || "Título del artículo"}</h1>
            <div className="flex items-center gap-4 text-xs text-white/40 mb-5">
              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{readingTime} min de lectura</span>
              <span>{words} palabras</span>
            </div>
            <p className="text-white/50 italic text-sm mb-6 border-l-2 border-white/10 pl-3">{excerpt || "Resumen del artículo..."}</p>
            <div className="prose prose-sm prose-invert max-w-none prose-headings:text-white prose-p:text-white/70 prose-li:text-white/70">
              {content ? (
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => <h2 className="text-white text-xl font-bold mt-8 mb-4">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-white/90 text-lg font-bold mt-6 mb-3">{children}</h3>,
                    p: ({ children }) => <p className="text-white/65 mb-4 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 mb-4">{children}</ul>,
                    li: ({ children }) => <li className="text-white/65">{children}</li>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-white/30 italic">Empieza a escribir para ver la vista previa...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Panel Footer — Publish */}
      <div className="border-t border-white/10 px-5 py-3 flex items-center justify-between flex-shrink-0 bg-[#141416]">
        <span className="text-xs text-white/30">
          {deletingConfirm ? "⚠️ Click en 🗑️ de nuevo para confirmar" : `${words} palabras`}
        </span>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || isEmpty}
          size={"sm" as any}
          className="gap-2 bg-primary hover:bg-primary/90 px-5"
        >
          {saveMutation.isPending ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Guardando...</>
          ) : (
            isNew ? "Publicar" : "Guardar cambios"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main CMS ────────────────────────────────────────────────────────────────
type NavSection = "posts" | "categories" | "authors" | "settings";

function CMS({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [navSection, setNavSection] = useState<NavSection>("posts");
  const [selectedPostId, setSelectedPostId] = useState<string | "new" | null>(null);
  const [search, setSearch] = useState("");

  // React Query Hooks for Author & Settings (Replacing localStorage)
  const { data: authorData, isLoading: loadingAuthor } = useQuery<Author>({
    queryKey: ["/api/admin/author"],
  });

  const { data: siteSettingsData, isLoading: loadingSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/settings"],
  });

  // Local state for forms
  const [authorForm, setAuthorForm] = useState<Partial<Author>>({
    name: "", role: "", bio: "", avatar: "", location: ""
  });
  const [settingsForm, setSettingsForm] = useState<Partial<SiteSettings>>({
    title: "", description: ""
  });

  useEffect(() => {
    if (authorData?.name) setAuthorForm(authorData);
  }, [authorData]);

  useEffect(() => {
    if (siteSettingsData?.title) setSettingsForm(siteSettingsData);
  }, [siteSettingsData]);

  const saveAuthorMutation = useMutation({
    mutationFn: async (data: Partial<Author>) => {
      const res = await fetch("/api/admin/author", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/author"] });
      toast({ title: "✅ Perfil de autor guardado" });
    },
    onError: () => toast({ variant: "destructive", title: "Error al guardar perfil" }),
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "✅ Configuración guardada" });
      document.title = saved.title;
    },
    onError: () => toast({ variant: "destructive", title: "Error al guardar configuración" }),
  });

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    refetchOnMount: "always",
  });

  const selectedPost = useMemo(
    () => posts.find((p) => p.id === selectedPostId),
    [posts, selectedPostId]
  );

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q)
    );
  }, [posts, search]);

  const handleSaved = useCallback((saved: BlogPost) => {
    setSelectedPostId(saved.id);
  }, []);

  const handleDeleted = useCallback(() => {
    setSelectedPostId(null);
  }, []);

  return (
    <div className="flex h-screen bg-[#0f0f11] text-white overflow-hidden font-sans">
      {/* ── Col 1: Left Nav ────────────────────────────────────── */}
      <div className="w-48 flex-shrink-0 border-r border-white/8 flex flex-col bg-[#141416]">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-white">Content Manager</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <p className="px-2 mb-2 text-xs text-white/30 uppercase tracking-widest">Contenido</p>
          <NavItem icon={FileText} label="Posts" active={navSection === "posts"} onClick={() => { setNavSection("posts"); setSelectedPostId(null); }} />
          <NavItem icon={Tag} label="Categorías" active={navSection === "categories"} onClick={() => setNavSection("categories")} />
          <NavItem icon={UserIcon} label="Autor" active={navSection === "authors"} onClick={() => setNavSection("authors")} />
          <div className="pt-3 pb-1">
            <p className="px-2 mb-2 text-xs text-white/30 uppercase tracking-widest">Sistema</p>
          </div>
          <NavItem icon={Settings} label="Configuración" active={navSection === "settings"} onClick={() => setNavSection("settings")} />
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-white/8">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>

      {/* ── Col 2: Post List ───────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 border-r border-white/8 flex flex-col bg-[#17171a]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-white capitalize">
            {navSection === "posts" ? "Posts" : navSection === "categories" ? "Categorías" : navSection === "authors" ? "Autores" : "Settings"}
          </h2>
          {navSection === "posts" && (
            <button
              onClick={() => setSelectedPostId("new")}
              className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              title="Nuevo artículo"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search */}
        {navSection === "posts" && (
          <div className="px-3 py-2 border-b border-white/8">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-white/5 border border-white/8 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Stats bar */}
        {navSection === "posts" && !isLoading && (
          <div className="px-4 py-2 border-b border-white/5 flex items-center gap-3">
            <span className="text-xs text-white/30">{posts.length} artículos</span>
            {search && <span className="text-xs text-primary">{filteredPosts.length} resultados</span>}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {navSection === "posts" ? (
            isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3 border-b border-white/5">
                  <Skeleton className="w-10 h-10 rounded-lg bg-white/5" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-full bg-white/5" />
                    <Skeleton className="h-2.5 w-2/3 bg-white/5" />
                  </div>
                </div>
              ))
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{search ? "Sin resultados" : "No hay posts"}</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  selected={selectedPostId === post.id}
                  onClick={() => setSelectedPostId(post.id)}
                />
              ))
            )
          ) : navSection === "categories" ? (
            <div className="p-4 space-y-2">
              {CATEGORIES.map((cat) => {
                const count = posts.filter((p) => p.category === cat).length;
                return (
                  <div key={cat} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                    <span className="text-sm text-white/70">{cat}</span>
                    <span className="text-xs text-white/30">{count} posts</span>
                  </div>
                );
              })}
            </div>
          ) : navSection === "authors" ? (
            <div className="p-2">
              <button
                className="w-full flex items-center gap-3 px-3 py-3 text-left bg-primary/10 border-l-2 border-l-primary"
              >
                <img src={authorForm.avatar || ""} className="w-8 h-8 rounded-full object-cover bg-white/10" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{authorForm.name || "Nuevo Autor"}</p>
                  <p className="text-xs text-white/40 truncate">{authorForm.role || "Sin rol"}</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="p-2">
              <button
                className="w-full flex items-center gap-3 px-3 py-3 text-left bg-primary/10 border-l-2 border-l-primary"
              >
                <Settings className="w-5 h-5 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">General</p>
                  <p className="text-xs text-white/40 truncate">Configuración básica</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Col 3: Edit Panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1a1a1d]">
        {navSection === "posts" ? (
          selectedPostId === null ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <FileText className="w-12 h-12 text-white/15 mx-auto mb-4" />
                <p className="text-white/40 font-semibold">Selecciona un artículo</p>
                <p className="text-white/25 text-sm mt-1">o crea uno nuevo con el botón +</p>
                <button
                  onClick={() => setSelectedPostId("new")}
                  className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo artículo
                </button>
              </div>
            </div>
          ) : (
            <EditPanel
              key={selectedPostId}
              post={selectedPostId === "new" ? undefined : selectedPost}
              isNew={selectedPostId === "new"}
              onSaved={handleSaved}
              onDeleted={handleDeleted}
            />
          )
        ) : navSection === "authors" ? (
          <div className="flex flex-col h-full">
            <div className="px-5 py-3 border-b border-white/10">
              <h2 className="text-white font-semibold text-sm">Editar Perfil del Autor</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl">
              <div className="flex items-center gap-6 mb-4">
                <img src={authorForm.avatar || ""} className="w-20 h-20 rounded-full border-2 border-white/10 shadow-lg object-cover bg-white/10" />
                <div className="space-y-2 flex-1">
                  <label className="text-xs text-white/40 uppercase font-bold">URL del Avatar</label>
                  <Input 
                    value={authorForm.avatar || ""} 
                    onChange={e => setAuthorForm({...authorForm, avatar: e.target.value})}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase font-bold">Nombre</label>
                  <Input value={authorForm.name || ""} onChange={e => setAuthorForm({...authorForm, name: e.target.value})} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase font-bold">Puesto/Rol</label>
                  <Input value={authorForm.role || ""} onChange={e => setAuthorForm({...authorForm, role: e.target.value})} className="bg-white/5 border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase font-bold">Bio</label>
                <Textarea 
                  value={authorForm.bio || ""} 
                  onChange={e => setAuthorForm({...authorForm, bio: e.target.value})} 
                  rows={4}
                  className="bg-white/5 border-white/10 resize-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase font-bold">Ubicación</label>
                <Input value={authorForm.location || ""} onChange={e => setAuthorForm({...authorForm, location: e.target.value})} className="bg-white/5 border-white/10" />
              </div>
            </div>
            <div className="border-t border-white/10 p-4 bg-[#141416] flex justify-end">
              <Button 
                onClick={() => saveAuthorMutation.mutate(authorForm)}
                disabled={saveAuthorMutation.isPending}
              >
                {saveAuthorMutation.isPending ? "Guardando..." : "Guardar Perfil"}
              </Button>
            </div>
          </div>
        ) : navSection === "settings" ? (
          <div className="flex flex-col h-full">
            <div className="px-5 py-3 border-b border-white/10">
              <h2 className="text-white font-semibold text-sm">Configuración General</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl">
              <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase font-bold">Título del Blog</label>
                <Input value={settingsForm.title || ""} onChange={e => setSettingsForm({...settingsForm, title: e.target.value})} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase font-bold">Descripción / SEO</label>
                <Textarea 
                  value={settingsForm.description || ""} 
                  onChange={e => setSettingsForm({...settingsForm, description: e.target.value})} 
                  className="bg-white/5 border-white/10" 
                />
              </div>
            </div>
            <div className="border-t border-white/10 p-4 bg-[#141416] flex justify-end">
              <Button 
                onClick={() => saveSettingsMutation.mutate(settingsForm)}
                disabled={saveSettingsMutation.isPending}
              >
                {saveSettingsMutation.isPending ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function AdminBlog() {
  const [isAuth, setIsAuth] = useState(false);
  if (!isAuth) return <LoginScreen onLogin={() => setIsAuth(true)} />;
  return <CMS onLogout={() => setIsAuth(false)} />;
}
