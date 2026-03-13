import { Twitter, Linkedin, Globe, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import type { Author as DBAuthor } from "@shared/schema";

interface Author {
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  location?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

const defaultAuthor: Author = {
  name: "Mario Sanchez",
  role: "Especialista en Sistemas Hidráulicos",
  bio: "Experto con más de 10 años de experiencia en el mantenimiento y optimización de sistemas de almacenamiento de agua. Apasionado por la sostenibilidad y el cuidado del vital líquido en Querétaro.",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mario",
  location: "Querétaro, Qro.",
  social: {
    twitter: "#",
    linkedin: "#",
    website: "https://lavadotinacos.com",
  },
};

export default function AuthorProfile({ author: manualAuthor }: { author?: Author }) {
  const { data: dbAuthor, isLoading } = useQuery<DBAuthor>({
    queryKey: ["/api/author"],
    enabled: !manualAuthor,
  });

  const author = manualAuthor || (dbAuthor && dbAuthor.name ? {
    name: dbAuthor.name,
    role: dbAuthor.role || defaultAuthor.role,
    bio: dbAuthor.bio || defaultAuthor.bio,
    avatar: dbAuthor.avatar || defaultAuthor.avatar,
    location: dbAuthor.location || defaultAuthor.location,
    social: defaultAuthor.social, // Keep default social for now as it's not in DB yet
  } : defaultAuthor);

  if (!manualAuthor && isLoading) {
    return <div className="h-48 bg-slate-50 animate-pulse rounded-3xl" />;
  }

  return (
    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 mb-12">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
            {author.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{author.name}</h3>
              <p className="text-slate-500 text-sm font-medium">{author.role}</p>
            </div>
            
            <div className="flex items-center justify-center md:justify-end gap-3">
              {author.social?.twitter && (
                <a href={author.social.twitter} className="p-2 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {author.social?.linkedin && (
                <a href={author.social.linkedin} className="p-2 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {author.social?.website && (
                <a href={author.social.website} className="p-2 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed mb-4 italic">
            "{author.bio}"
          </p>

          <div className="flex items-center justify-center md:justify-start gap-1.5 text-slate-400 text-xs font-medium">
            <MapPin className="w-3 h-3" />
            <span>{author.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
