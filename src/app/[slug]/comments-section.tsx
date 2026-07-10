"use client";

import React, { useEffect, useState } from "react";
import { http } from "@/lib/http-client";
import { useAuthStore } from "@/store/use-auth-store";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  creator: {
    id: string;
    fullName: string;
    slug: string;
    photoPath: string | null;
  };
}

interface CommentsSectionProps {
  packId: string;
}

export default function CommentsSection({ packId }: CommentsSectionProps) {
  const user = useAuthStore((s) => s.user);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const data = await http<Comment[]>(`/packs/${packId}/comments`);
      setComments(data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComments(); }, [packId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const created = await http<Comment>(`/packs/${packId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment.trim() }),
      });
      setComments(prev => [created, ...prev]);
      setNewComment("");
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await http(`/packs/comments/${commentId}`, { method: "DELETE" });
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">chat</span>
        Comentarios ({comments.length})
      </h3>

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            maxLength={500}
            className="flex-1 bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container-high transition-all outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="bg-primary text-white px-5 py-3 rounded-xl font-headline font-bold text-sm disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {submitting ? (
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            ) : (
              "Enviar"
            )}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-on-surface-variant italic text-center py-8">
          Aún no hay comentarios. ¡Sé la primera en comentar!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-surface-container-low rounded-2xl p-4 flex gap-3">
              {c.creator.photoPath ? (
                <img src={c.creator.photoPath} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {c.creator.fullName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-headline font-bold text-sm text-on-surface truncate">
                    {c.creator.fullName}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-on-surface-variant/50">
                      {new Date(c.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </span>
                    {user?.id === c.creator.id && (
                      <button onClick={() => handleDelete(c.id)} className="text-on-surface-variant/50 hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-on-surface mt-1">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
