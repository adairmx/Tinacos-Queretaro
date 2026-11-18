import { MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import type { Author as DBAuthor } from "@shared/schema";
import { CALIFICACION } from "./ServiceCta";

interface Author {
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  location?: string;
}

/**
 * Sin autor cargado en el panel se muestra la marca, no una persona inventada: antes salía un
 * «Mario Sánchez» de ejemplo con años de experiencia que nadie tenía.
 */
const defaultAuthor: Author = {
  name: "Equipo técnico MonsterCo",
  role: "Lavado y desinfección de tinacos y cisternas",
  bio: "Lavamos tinacos y cisternas a domicilio. Escribimos estas guías con lo que vemos en cada servicio para que cuides el agua de tu casa, y si prefieres que lo hagamos nosotros, aquí estamos.",
  avatar: "/favicon.png",
  location: "Querétaro y 12 ciudades de México",
};

export default function AuthorProfile({ author: manualAuthor }: { author?: Author }) {
  const { data: dbAuthor, isLoading } = useQuery<DBAuthor>({
    queryKey: ["/api/author"],
    enabled: !manualAuthor,
  });

  const author: Author =
    manualAuthor ||
    (dbAuthor && dbAuthor.name
      ? {
          name: dbAuthor.name,
          role: dbAuthor.role || defaultAuthor.role,
          bio: dbAuthor.bio || defaultAuthor.bio,
          avatar: dbAuthor.avatar || undefined,
          location: dbAuthor.location || defaultAuthor.location,
        }
      : defaultAuthor);

  if (!manualAuthor && isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-slate-50" />;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
        <Avatar className="h-16 w-16 border-4 border-white bg-white shadow-md">
          <AvatarImage src={author.avatar} alt={author.name} className="object-contain p-1" />
          <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Escrito por</p>
          <h3 className="mt-1 font-heading text-lg font-bold text-slate-900">{author.name}</h3>
          <p className="text-sm font-medium text-slate-500">{author.role}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{author.bio}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500 sm:justify-start">
            {author.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {author.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {CALIFICACION.estrellas} en Google ·{" "}
              {CALIFICACION.resenas} reseñas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
