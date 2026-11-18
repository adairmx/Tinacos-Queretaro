import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, MessageCircle } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { FeaturedPost } from "@/components/blog/FeaturedPost";
import { TarjetaServicio, enlaceWhatsApp } from "@/components/blog/ServiceCta";
import AdSenseBanner, { AD_SLOTS } from "@/components/blog/AdSenseBanner";
import { useSeo } from "@/hooks/use-seo";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlogPost, SiteSettings } from "@shared/schema";

/** Problemas que la gente busca; cada uno filtra los artículos por esas palabras. */
const SINTOMAS = [
  { etiqueta: "Agua turbia", buscar: "turbia" },
  { etiqueta: "Lodo en el fondo", buscar: "lodo" },
  { etiqueta: "Sarro", buscar: "sarro" },
  { etiqueta: "Mal olor o agua amarilla", buscar: "olor" },
  { etiqueta: "No sube el agua", buscar: "sube" },
  { etiqueta: "¿Cuánto cuesta?", buscar: "cuesta" },
];

/** Posición en la rejilla (antes de qué artículo) → bloque de AdSense. */
const ANUNCIOS_REJILLA: Record<number, string> = { 5: AD_SLOTS.article2, 11: AD_SLOTS.article3 };

const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export default function Blog() {
  const { data: posts = [], isFetching } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    refetchOnMount: "always",
  });
  const { data: settings } = useQuery<SiteSettings>({ queryKey: ["/api/settings"] });

  useSeo({
    title: "Blog: consejos para tinacos y cisternas | MonsterCo",
    description:
      settings?.description ||
      "Guías prácticas para tu tinaco, cisterna y bomba: agua turbia, lodo, sarro, mal olor, precios y cada cuánto lavar.",
    path: "/blog",
  });

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);

  const categorias = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category).filter((c): c is string => !!c && c !== "General"))).sort(),
    [posts],
  );

  const filtrando = busqueda.trim() !== "" || categoria !== null;

  const resultados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return posts.filter((p) => {
      const coincide = !q || normalizar(`${p.title} ${p.excerpt} ${p.content}`).includes(q);
      return coincide && (!categoria || p.category === categoria);
    });
  }, [posts, busqueda, categoria]);

  const destacado = !filtrando ? posts[0] : undefined;
  const rejilla = filtrando ? resultados : posts.slice(1);

  const limpiar = () => {
    setBusqueda("");
    setCategoria(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Portada */}
        <section className="border-b border-slate-100 bg-gradient-to-b from-sky-50 via-sky-50/40 to-background">
          <div className="container mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent">Guías MonsterCo</p>
              <h1 className="mt-3 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-5xl">
                Agua limpia en casa,
                <span className="block text-primary">sin adivinar qué hacer.</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
                Guías sobre tinacos, cisternas y bombas, escritas por quienes los lavan todos los días.
              </p>

              <div className="relative mt-7 max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="¿Qué le pasa a tu tinaco o cisterna?"
                  aria-label="Buscar en el blog"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-base shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => setBusqueda("")}
                    aria-label="Borrar búsqueda"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {SINTOMAS.map((s) => {
                  const activo = normalizar(busqueda) === s.buscar;
                  return (
                    <button
                      key={s.buscar}
                      type="button"
                      onClick={() => setBusqueda(activo ? "" : s.buscar)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                        activo
                          ? "border-primary bg-primary text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {s.etiqueta}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:block">
              <TarjetaServicio />
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-6xl px-4 py-10 md:py-12">
          {/* Categorías */}
          {categorias.length > 0 && (
            <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              <button
                type="button"
                onClick={() => setCategoria(null)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  categoria === null ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Todo
              </button>
              {categorias.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoria(categoria === c ? null : c)}
                  className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    categoria === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {isFetching && posts.length === 0 ? (
            <>
              <Skeleton className="mb-10 h-[340px] w-full rounded-3xl" />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            </>
          ) : (
            <>
              {destacado && (
                <>
                  <FeaturedPost post={destacado} />
                  <AdSenseBanner slot={AD_SLOTS.article1} />
                </>
              )}

              {filtrando && (
                <div className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-slate-600">
                    {resultados.length} {resultados.length === 1 ? "artículo" : "artículos"}
                    {busqueda.trim() && (
                      <>
                        {" "}
                        sobre <strong className="text-slate-900">“{busqueda.trim()}”</strong>
                      </>
                    )}
                  </span>
                  <button type="button" onClick={limpiar} className="flex items-center gap-1 font-semibold text-primary hover:underline">
                    <X className="h-4 w-4" /> Ver todo
                  </button>
                </div>
              )}

              {rejilla.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-16 text-center">
                  <p className="font-heading text-xl font-bold text-slate-900">
                    {filtrando ? "No encontramos una guía sobre eso… todavía." : "Pronto publicaremos más guías."}
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-slate-500">
                    Cuéntanos qué le pasa a tu tinaco o cisterna y te decimos qué hacer, sin compromiso.
                  </p>
                  <a
                    href={enlaceWhatsApp(`Hola, tengo una duda con mi tinaco o cisterna: ${busqueda.trim()}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-[#25D366] px-6 font-bold text-white shadow-md hover:bg-[#1ebe5a]"
                  >
                    <MessageCircle className="h-5 w-5 fill-current" /> Preguntar por WhatsApp
                  </a>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rejilla.map((post, i) => (
                    <Fragment key={post.id}>
                      {/* Un anuncio del tamaño de una tarjeta cada dos filas, nunca de primero. */}
                      {!filtrando && ANUNCIOS_REJILLA[i] && <AdSenseBanner slot={ANUNCIOS_REJILLA[i]} variant="rejilla" />}
                      <BlogCard post={post} />
                    </Fragment>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

