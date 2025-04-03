"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Check, X, SendHorizontal, Trash2 } from "lucide-react";

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

interface CommentsTabProps {
  campaign: Record<string, any>;
}

export function CommentsTab({ campaign }: CommentsTabProps) {
  const [comments, setComments] = useState<CampaignComment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [newComment, setNewComment] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const {
    isLoadingComments,
    isPostingComment,
    getCampaignComments,
    postCampaignComment,
    deleteCampaignComment,
  } = useCampaign();

  useEffect(() => {
    fetchComments();
  }, [campaign.id]);

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

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "El comentario no puede estar vacío",
        variant: "destructive",
      });
      return;
    }

    const commentData = await postCampaignComment(campaign.id, newComment);

    if (commentData) {
      // Add the new comment to the top of the list
      setComments([commentData, ...comments]);
      setTotalComments(totalComments + 1);
      setNewComment("");
    }
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    const success = await deleteCampaignComment(campaign.id, commentToDelete);

    if (success) {
      // Remove the comment from the list
      setComments(comments.filter((comment) => comment.id !== commentToDelete));
      setTotalComments(totalComments - 1);
    }

    setIsDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const openDeleteDialog = (commentId: string) => {
    setCommentToDelete(commentId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Comentarios</h2>
        <p className="text-gray-600 mb-6">
          Gestiona los comentarios de tu campaña y responde a los donadores.
        </p>
      </div>

      {/* Comment stats */}
      <div className="bg-gray-50 p-4 rounded-lg flex space-x-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Total de comentarios
            </p>
            <p className="text-2xl font-bold text-gray-900">{totalComments}</p>
          </div>
        </div>
      </div>

      {/* Add new comment */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-[#e8f0e9] flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-[#2c6e49]" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative">
              <textarea
                rows={3}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#2c6e49] sm:text-sm sm:leading-6"
                placeholder="Escribe un comentario"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                className="inline-flex items-center px-4 bg-[#2c6e49] hover:bg-[#1e4d33] text-white"
                disabled={isPostingComment || !newComment.trim()}
                onClick={handleSubmitComment}
              >
                {isPostingComment ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <SendHorizontal className="h-4 w-4 mr-2" />
                )}
                Comentar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comment list */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">
          {totalComments > 0
            ? `Comentarios (${totalComments})`
            : "No hay comentarios"}
        </h3>

        {isLoadingComments && comments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-[#e8f0e9] flex items-center justify-center font-bold text-[#2c6e49]">
                      {comment.profile.name?.charAt(0) || "?"}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.profile.name}
                      </p>
                      <button
                        onClick={() => openDeleteDialog(comment.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{comment.content}</p>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el comentario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteComment}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
