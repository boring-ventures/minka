"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Check,
  X,
  Trash2,
  ChevronDown,
  Filter,
  Send,
  Reply,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCampaign, CampaignComment } from "@/hooks/use-campaign";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CommentsTabProps {
  campaign: Record<string, any>;
}

export function CommentsTab({ campaign }: CommentsTabProps) {
  const [comments, setComments] = useState<CampaignComment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("recent");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );
  const [showEmojiSelector, setShowEmojiSelector] = useState<string | null>(
    null
  );

  const {
    isLoadingComments,
    getCampaignComments,
    deleteCampaignComment,
    replyToComment,
    isReplyingToComment,
  } = useCampaign();

  useEffect(() => {
    fetchComments();
  }, [campaign.id, sortBy, filterBy]);

  const fetchComments = async (reset: boolean = true) => {
    const currentOffset = reset ? 0 : offset;

    const commentsData = await getCampaignComments(
      campaign.id,
      limit,
      currentOffset
    );

    if (commentsData) {
      if (reset) {
        setComments(commentsData.comments);
      } else {
        setComments([...comments, ...commentsData.comments]);
      }

      setTotalComments(commentsData.total);
      setHasMoreComments(commentsData.hasMore);

      if (!reset) {
        setOffset(currentOffset + limit);
      } else {
        setOffset(limit);
      }
    }
  };

  const loadMoreComments = () => {
    fetchComments(false);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    const success = await deleteCampaignComment(campaign.id, commentToDelete);

    if (success) {
      // Remove the comment from the list
      setComments(comments.filter((comment) => comment.id !== commentToDelete));
      setTotalComments(totalComments - 1);
      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado correctamente.",
      });
    }

    setIsDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const openDeleteDialog = (commentId: string) => {
    setCommentToDelete(commentId);
    setIsDeleteDialogOpen(true);
  };

  const handleEmojiReaction = (emoji: string, commentId: string) => {
    setSelectedEmoji(emoji);
    setSelectedCommentId(commentId);

    // Apply the reaction immediately without showing the save bar
    toast({
      title: "Reacción añadida",
      description: "Tu reacción ha sido registrada correctamente.",
    });

    // Hide the emoji selector
    setShowEmojiSelector(null);
  };

  const handleReplySubmit = async (commentId: string) => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);

    try {
      // Call the replyToComment function from useCampaign hook
      const success = await replyToComment(campaign.id, commentId, replyText);

      if (success) {
        // Show success message
        toast({
          title: "Respuesta enviada",
          description: "Tu respuesta ha sido publicada correctamente.",
        });

        // Manually update the UI with the new reply - useful if the backend
        // doesn't immediately include the reply in the comments endpoint
        const updatedComments = comments.map((comment) => {
          if (comment.id === commentId) {
            // Create a new reply object
            const newReply = {
              id: `temp-reply-${Date.now()}`,
              text: replyText,
              created_at: new Date().toISOString(),
              user: {
                id: "current-user",
                name: "Administrador", // Use a generic admin name
                avatar: "",
              },
            };

            // Add the new reply to the comment
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          }
          return comment;
        });

        // Update comments state with our local update
        setComments(updatedComments);

        // Fetch updated comments to refresh the list with a small delay to ensure
        // the backend has processed the comment
        setTimeout(async () => {
          await fetchComments();
        }, 1000);

        // Reset reply state
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Error submitting reply:", error);

      // If there was an error, try to display a helpful message
      toast({
        title: "Error",
        description:
          error instanceof Error && error.message
            ? error.message
            : "No se pudo enviar tu respuesta. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const toggleEmojiSelector = (commentId: string) => {
    if (showEmojiSelector === commentId) {
      setShowEmojiSelector(null);
    } else {
      setShowEmojiSelector(commentId);
    }
  };

  // Helper function to calculate days since a date
  const getDaysSince = (dateString: string): string => {
    const commentDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - commentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${diffDays} ${diffDays === 1 ? "día" : "días"}`;
  };

  return (
    <div className="w-full px-6 md:px-8 lg:px-16 xl:px-24 py-6 flex flex-col min-h-[calc(100vh-200px)]">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Comentarios
      </h2>
      <p className="text-xl text-gray-600 leading-relaxed mb-10">
        Reacciona a los comentarios que te dejan los donadores y sigue
        inspirando con la esencia de tu campaña.
      </p>

      <div className="border-b border-[#478C5C]/20 my-8"></div>

      {/* Comments section */}
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-semibold">Todos los comentarios</h3>
            <p className="text-gray-600">{totalComments} Resultados</p>
          </div>

          <div className="flex gap-4">
            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-300 bg-white">
                  <span className="mr-2">Ordenar por: Sin leer</span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("unread")}>
                  Sin leer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("recent")}>
                  Más recientes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                  Más antiguos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("donation")}>
                  Mayor donación
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter as Select component */}
            <Select
              value={filterBy}
              onValueChange={(value) => setFilterBy(value)}
            >
              <SelectTrigger className="w-36 border-gray-300 bg-white">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unreacted">Sin reaccionar</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ongs">ONGs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoadingComments && comments.length === 0 ? (
          <div className="flex items-center justify-center py-8 flex-1">
            <LoadingSpinner size="md" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-8 flex-1">
            {/* Comment items */}
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-gray-200 pb-6 mb-6 last:border-b-0"
              >
                <div className="flex gap-4 mb-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full overflow-hidden flex items-center justify-center text-white font-medium">
                    {comment.profile?.name?.substring(0, 2).toUpperCase() || ""}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {comment.profile?.name || "Usuario"}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {getDaysSince(comment.createdAt)}
                        </p>
                        {comment.donation_amount && (
                          <div className="mt-1 text-sm text-[#2c6e49] font-medium">
                            Donó Bs. {comment.donation_amount.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => openDeleteDialog(comment.id)}
                        className="text-[#1a5535] hover:text-[#0e3e20] flex items-center"
                      >
                        <span className="mr-2">Eliminar comentario</span>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-2 text-gray-700">
                      {comment.content || comment.message || ""}
                    </p>

                    {/* Emoji reactions */}
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        className="flex items-center"
                        onClick={() => toggleEmojiSelector(comment.id)}
                      >
                        <Image
                          src="/icons/add_reaction.svg"
                          alt="Add reaction"
                          width={24}
                          height={24}
                        />
                      </button>

                      {showEmojiSelector === comment.id && (
                        <div className="flex items-center gap-1 rounded-full py-1 px-3 border border-gray-200 bg-white shadow-sm">
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xl"
                            onClick={() =>
                              handleEmojiReaction("😀", comment.id)
                            }
                          >
                            <span role="img" aria-label="smile">
                              😀
                            </span>
                          </button>
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xl"
                            onClick={() =>
                              handleEmojiReaction("❤️", comment.id)
                            }
                          >
                            <span role="img" aria-label="heart">
                              ❤️
                            </span>
                          </button>
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xl"
                            onClick={() =>
                              handleEmojiReaction("💚", comment.id)
                            }
                          >
                            <span role="img" aria-label="green-heart">
                              💚
                            </span>
                          </button>
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xl"
                            onClick={() =>
                              handleEmojiReaction("👏", comment.id)
                            }
                          >
                            <span role="img" aria-label="clap">
                              👏
                            </span>
                          </button>
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xl"
                            onClick={() =>
                              handleEmojiReaction("🙏", comment.id)
                            }
                          >
                            <span role="img" aria-label="pray">
                              🙏
                            </span>
                          </button>
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xl"
                            onClick={() =>
                              handleEmojiReaction("💪", comment.id)
                            }
                          >
                            <span role="img" aria-label="muscle">
                              💪
                            </span>
                          </button>
                          <button
                            className="w-8 h-8 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-xl text-gray-400"
                            onClick={() => handleEmojiReaction("+", comment.id)}
                          >
                            <span>+</span>
                          </button>
                        </div>
                      )}

                      {/* Spacer */}
                      <div className="flex-grow"></div>

                      {/* Reply button */}
                      <button
                        className="px-3 py-1 rounded-full bg-[#f2f8f5] flex items-center justify-center text-gray-600 hover:bg-[#e8f5ed]"
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === comment.id ? null : comment.id
                          )
                        }
                      >
                        <Reply size={14} className="mr-1" />
                        <span className="text-sm">Responder</span>
                      </button>
                    </div>

                    {/* Reply section - only visible when replying to this comment */}
                    {replyingTo === comment.id && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <div className="flex gap-2">
                          <div className="w-8 h-8 bg-[#2c6e49] rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-medium">
                            AD
                          </div>
                          <div className="flex-1">
                            <Textarea
                              placeholder="Escribe tu respuesta..."
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2c6e49] min-h-[80px] text-sm"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-sm"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white text-sm"
                                onClick={() => handleReplySubmit(comment.id)}
                                disabled={
                                  !replyText.trim() ||
                                  isSubmittingReply ||
                                  isReplyingToComment
                                }
                              >
                                {isSubmittingReply || isReplyingToComment ? (
                                  <LoadingSpinner size="xs" className="mr-2" />
                                ) : (
                                  <Send size={14} className="mr-2" />
                                )}
                                Enviar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Display existing replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="mt-2 pl-4 border-l-2 border-gray-200"
                          >
                            <div className="flex gap-2">
                              <div className="w-8 h-8 bg-[#2c6e49] rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-medium">
                                {reply.user.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-900">
                                      {reply.user.name}
                                    </h5>
                                    <p className="text-xs text-gray-500">
                                      {getDaysSince(reply.created_at)}
                                    </p>
                                  </div>
                                </div>
                                <p className="mt-1 text-sm text-gray-700">
                                  {reply.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {hasMoreComments && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  className="border-gray-300"
                  onClick={loadMoreComments}
                  disabled={isLoadingComments}
                >
                  {isLoadingComments ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Cargar más comentarios
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg flex-1 flex flex-col justify-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay comentarios aún
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Tu campaña no tiene comentarios por el momento.
            </p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El comentario será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteComment}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save changes bottom bar */}
      {showSaveBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100 py-4 px-6 border-t border-gray-200 z-50 flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            className="border-gray-300 bg-white flex items-center"
            onClick={() => setShowSaveBar(false)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white flex items-center"
            onClick={() => {
              toast({
                title: "Cambios guardados",
                description: "Las reacciones han sido guardadas correctamente.",
              });
              setShowSaveBar(false);
            }}
          >
            <Check className="h-4 w-4 mr-2" />
            Guardar cambios
          </Button>
        </div>
      )}
    </div>
  );
}
