"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { MessageSquare, Check, X, SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CommentsTabProps {
  campaign: any;
}

type Comment = {
  id: string;
  user_name: string;
  user_id: string;
  created_at: string;
  content: string;
  is_hidden: boolean;
  reply?: string;
  reply_at?: string;
};

export function CommentsTab({ campaign }: CommentsTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyData, setReplyData] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("campaign_comments")
        .select("*, user_profiles(*)")
        .eq("campaign_id", campaign.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedComments = data.map((comment) => ({
          id: comment.id,
          user_name: comment.user_profiles?.name || "Usuario anónimo",
          user_id: comment.user_id,
          created_at: comment.created_at,
          content: comment.content,
          is_hidden: comment.is_hidden || false,
          reply: comment.reply,
          reply_at: comment.reply_at,
        }));

        setComments(formattedComments);
      } else if (process.env.NODE_ENV === "development") {
        // Add dummy comments for development
        setComments([
          {
            id: "1",
            user_name: "María Rodríguez",
            user_id: "user1",
            created_at: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            content:
              "¡Excelente iniciativa! ¿Tienen planeadas más actividades de voluntariado próximamente?",
            is_hidden: false,
            reply:
              "¡Gracias por tu apoyo, María! Sí, estamos organizando una jornada de reforestación para el próximo mes. Publicaremos más detalles pronto.",
            reply_at: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: "2",
            user_name: "Carlos Mendoza",
            user_id: "user2",
            created_at: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            content:
              "Estuve visitando el parque hace poco y es impresionante la biodiversidad. ¡Hay que protegerlo!",
            is_hidden: false,
          },
          {
            id: "3",
            user_name: "Usuario anónimo",
            user_id: "user3",
            created_at: new Date(
              Date.now() - 6 * 24 * 60 * 60 * 1000
            ).toISOString(),
            content:
              "Comentario inapropiado que ha sido ocultado por el administrador.",
            is_hidden: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);

      if (process.env.NODE_ENV === "development") {
        // Add dummy comments for development even on error
        setComments([
          {
            id: "1",
            user_name: "María Rodríguez",
            user_id: "user1",
            created_at: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            content:
              "¡Excelente iniciativa! ¿Tienen planeadas más actividades de voluntariado próximamente?",
            is_hidden: false,
            reply:
              "¡Gracias por tu apoyo, María! Sí, estamos organizando una jornada de reforestación para el próximo mes. Publicaremos más detalles pronto.",
            reply_at: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: "2",
            user_name: "Carlos Mendoza",
            user_id: "user2",
            created_at: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            content:
              "Estuve visitando el parque hace poco y es impresionante la biodiversidad. ¡Hay que protegerlo!",
            is_hidden: false,
          },
          {
            id: "3",
            user_name: "Usuario anónimo",
            user_id: "user3",
            created_at: new Date(
              Date.now() - 6 * 24 * 60 * 60 * 1000
            ).toISOString(),
            content:
              "Comentario inapropiado que ha sido ocultado por el administrador.",
            is_hidden: true,
          },
        ]);
      } else {
        toast({
          title: "Error",
          description:
            "No se pudieron cargar los comentarios. Intenta nuevamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplyChange = (commentId: string, value: string) => {
    setReplyData({
      ...replyData,
      [commentId]: value,
    });
  };

  const toggleReplyMode = (commentId: string) => {
    setReplying({
      ...replying,
      [commentId]: !replying[commentId],
    });
    if (!replying[commentId]) {
      setReplyData({
        ...replyData,
        [commentId]: "",
      });
    }
  };

  const submitReply = async (commentId: string) => {
    if (!replyData[commentId]?.trim()) return;

    const updatingReplying = { ...replying };
    updatingReplying[commentId] = false;
    setReplying(updatingReplying);

    try {
      const supabase = createClientComponentClient();

      const { error } = await supabase
        .from("campaign_comments")
        .update({
          reply: replyData[commentId],
          reply_at: new Date().toISOString(),
        })
        .eq("id", commentId);

      if (error) throw error;

      // Update the comment in the local state
      const updatedComments = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            reply: replyData[commentId],
            reply_at: new Date().toISOString(),
          };
        }
        return comment;
      });

      setComments(updatedComments);

      toast({
        title: "Respuesta enviada",
        description: "Tu respuesta ha sido publicada correctamente.",
      });
    } catch (error) {
      console.error("Error replying to comment:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const toggleCommentVisibility = async (
    commentId: string,
    currentState: boolean
  ) => {
    try {
      const supabase = createClientComponentClient();

      const { error } = await supabase
        .from("campaign_comments")
        .update({
          is_hidden: !currentState,
        })
        .eq("id", commentId);

      if (error) throw error;

      // Update the comment in the local state
      const updatedComments = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            is_hidden: !currentState,
          };
        }
        return comment;
      });

      setComments(updatedComments);

      toast({
        title: currentState ? "Comentario oculto" : "Comentario visible",
        description: currentState
          ? "El comentario ha sido ocultado de la vista pública."
          : "El comentario ahora es visible para todos.",
      });
    } catch (error) {
      console.error("Error toggling comment visibility:", error);
      toast({
        title: "Error",
        description:
          "No se pudo cambiar la visibilidad del comentario. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Comentarios</h2>
        <p className="text-sm text-gray-500">
          Gestiona y responde a los comentarios de los donadores y seguidores de
          tu campaña
        </p>
      </div>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-white border ${comment.is_hidden ? "border-gray-200 bg-gray-50" : "border-gray-200"} rounded-lg p-4 space-y-4`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-[#e8f0e9] flex items-center justify-center text-[#2c6e49] font-bold">
                      {comment.user_name?.charAt(0) || "U"}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium text-gray-900">
                        {comment.user_name}
                      </p>
                      {comment.is_hidden && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Oculto
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.created_at).toLocaleDateString()} a las{" "}
                      {new Date(comment.created_at).toLocaleTimeString()}
                    </p>
                    <p className="mt-2 text-gray-700">{comment.content}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      toggleCommentVisibility(comment.id, comment.is_hidden)
                    }
                    className={`rounded-full p-1 ${
                      comment.is_hidden
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title={
                      comment.is_hidden
                        ? "Mostrar comentario"
                        : "Ocultar comentario"
                    }
                  >
                    {comment.is_hidden ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleReplyMode(comment.id)}
                    className="bg-gray-100 rounded-full p-1 text-gray-600 hover:bg-gray-200"
                    title="Responder"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Reply section */}
              {comment.reply && !replying[comment.id] && (
                <div className="pl-12 mt-4 border-l-2 border-gray-100">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-[#e8f0e9] flex items-center justify-center text-[#2c6e49] font-bold">
                        {campaign.title?.charAt(0) || "O"}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Organizador</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {comment.reply_at &&
                          new Date(comment.reply_at).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-gray-700">{comment.reply}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reply form */}
              {replying[comment.id] && (
                <div className="border rounded-md mt-3">
                  <textarea
                    value={replyData[comment.id] || ""}
                    onChange={(e) =>
                      handleReplyChange(comment.id, e.target.value)
                    }
                    placeholder="Escribe tu respuesta..."
                    className="w-full p-3 rounded-t-md border-b text-sm"
                    rows={3}
                  />
                  <div className="flex justify-end p-2 bg-gray-50 rounded-b-md">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => toggleReplyMode(comment.id)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white flex items-center gap-1"
                      onClick={() => submitReply(comment.id)}
                      disabled={!replyData[comment.id]?.trim()}
                    >
                      <SendHorizontal className="h-3 w-3" />
                      Responder
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <MessageSquare className="h-10 w-10 mx-auto text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            No hay comentarios aún
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
            Cuando los seguidores de tu campaña dejen comentarios, aparecerán
            aquí.
          </p>
        </div>
      )}
    </div>
  );
}
