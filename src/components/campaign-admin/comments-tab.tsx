"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Check,
  X,
  Trash2,
  ChevronDown,
  Filter,
} from "lucide-react";

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

  const { isLoadingComments, getCampaignComments, deleteCampaignComment } =
    useCampaign();

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

  const handleEmojiReaction = () => {
    // This would be implemented to handle emoji reactions
    setShowSaveBar(true);
  };

  return (
    <div className="w-full px-6 md:px-8 lg:px-16 xl:px-24 py-6">
      <h2 className="text-4xl md:text-5xl font-bold mb-6">Comentarios</h2>
      <p className="text-xl text-gray-600 leading-relaxed mb-10">
        Reacciona a los comentarios que te dejan los donadores y sigue
        inspirando con la esencia de tu campaña.
      </p>

      <div className="border-b border-[#478C5C]/20 my-8"></div>

      {/* Comments section */}
      <div className="max-w-4xl mx-auto">
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

            {/* Filter dropdown */}
            <div className="relative">
              <div className="absolute top-0 left-0 w-full">
                <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="p-1 bg-[#f2f8f5] rounded-t-md border border-[#2c6e49] border-b-0">
                    <div className="px-3 py-2 text-[#1a5535] hover:bg-white cursor-pointer">
                      Sin reaccionar
                    </div>
                  </div>
                  <div className="p-1 bg-white rounded-b-md border border-[#2c6e49] border-t-0">
                    <div className="px-3 py-2 bg-[#e8f5ed] text-[#1a5535] font-medium">
                      Todos
                    </div>
                    <div className="px-3 py-2 text-gray-700 hover:bg-[#f2f8f5] cursor-pointer">
                      ONGs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isLoadingComments && comments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-8">
            {/* Comment items */}
            {[1, 2].map((item) => (
              <div
                key={item}
                className="border-b border-gray-200 pb-6 mb-6 last:border-b-0"
              >
                <div className="flex gap-4 mb-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full overflow-hidden flex items-center justify-center text-white font-medium">
                    NR
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Nadia Rosas
                        </h4>
                        <p className="text-gray-500 text-sm">
                          Bs. 200,00 | 3 días
                        </p>
                      </div>
                      <button
                        onClick={() => openDeleteDialog("comment-id")}
                        className="text-green-600 hover:text-green-800 flex items-center"
                      >
                        <span className="mr-2">Eliminar comentario</span>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-2 text-gray-700">
                      Es un honor poder contribuir a la conservación del Parque
                      Nacional Amboró. ¡Juntos podemos hacer la diferencia!
                      Sigamos protegiendo este maravilloso lugar
                    </p>

                    {/* Emoji reactions */}
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        className="w-8 h-8 rounded-full bg-[#f2f8f5] flex items-center justify-center text-gray-600"
                        onClick={handleEmojiReaction}
                      >
                        <span role="img" aria-label="smile">
                          😀
                        </span>
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-[#f2f8f5] flex items-center justify-center text-gray-600"
                        onClick={handleEmojiReaction}
                      >
                        <span role="img" aria-label="heart">
                          ❤️
                        </span>
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-[#f2f8f5] flex items-center justify-center text-gray-600"
                        onClick={handleEmojiReaction}
                      >
                        <span role="img" aria-label="green-heart">
                          💚
                        </span>
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-[#f2f8f5] flex items-center justify-center text-gray-600"
                        onClick={handleEmojiReaction}
                      >
                        <span role="img" aria-label="clap">
                          👏
                        </span>
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-[#f2f8f5] flex items-center justify-center text-gray-600"
                        onClick={handleEmojiReaction}
                      >
                        <span role="img" aria-label="thumbs-up">
                          👍
                        </span>
                      </button>
                      <button
                        className="w-8 h-8 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400"
                        onClick={handleEmojiReaction}
                      >
                        <span>+</span>
                      </button>
                    </div>
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
          <div className="text-center py-10 bg-gray-50 rounded-lg">
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
