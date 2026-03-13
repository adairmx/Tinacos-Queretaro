import { useState } from "react";
import { MessageSquare, User, Send, ThumbsUp, Reply } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  date: string;
  content: string;
  likes: number;
}

const mockComments: Comment[] = [
  {
    id: "1",
    author: "Juan Pérez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan",
    date: "Hace 2 días",
    content: "Excelente artículo. Justo hoy noté que mi tinaco tiene una pequeña fisura. Estos consejos me vienen de maravilla para saber qué hacer.",
    likes: 5,
  },
  {
    id: "2",
    author: "Elena Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    date: "Ayer",
    content: "¡Muchas gracias por la información! ¿Recomiendan algún producto específico para el sarro?",
    likes: 3,
  },
];

export default function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setIsPosting(true);

    // Mock delay
    await new Promise(r => setTimeout(r, 1000));

    const comment: Comment = {
      id: Math.random().toString(),
      author: "Lector Invitado",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
      date: "Ahora",
      content: newComment,
      likes: 0,
    };

    setComments([comment, ...comments]);
    setNewComment("");
    setIsPosting(false);
  };

  return (
    <div className="mt-16 pt-12 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-bold text-slate-900">Comentarios ({comments.length})</h3>
      </div>

      {/* Post Comment Form */}
      <div className="bg-slate-50 rounded-3xl p-6 mb-12">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10 border-2 border-white shadow-sm flex-shrink-0">
            <AvatarFallback className="bg-slate-200 text-slate-500">
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="Escribe tu comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-white border-slate-200 rounded-2xl min-h-[100px] focus:ring-primary/20"
            />
            <div className="flex justify-end">
              <Button
                onClick={handlePost}
                disabled={isPosting || !newComment.trim()}
                className="rounded-xl px-6"
              >
                {isPosting ? "Publicando..." : "Enviar Comentario"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-8">
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4"
          >
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm flex-shrink-0">
              <AvatarImage src={comment.avatar} />
              <AvatarFallback>{comment.author[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-900 text-sm">{comment.author}</h4>
                <span className="text-slate-400 text-xs">{comment.date}</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-3">
                {comment.content}
              </p>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{comment.likes}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Reply className="w-3.5 h-3.5" />
                  <span>Responder</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
