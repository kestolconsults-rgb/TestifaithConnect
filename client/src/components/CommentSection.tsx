import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Reply, Trash2 } from "lucide-react";
import type { CommentWithUser } from "@shared/schema";

interface CommentSectionProps {
  testimonyId: string;
}

interface CommentItemProps {
  comment: CommentWithUser;
  testimonyId: string;
  depth?: number;
}

function isUnauthorizedError(error: Error): boolean {
  return error.message.includes('401') || error.message.includes('Unauthorized');
}

function CommentItem({ comment, testimonyId, depth = 0 }: CommentItemProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return await apiRequest("DELETE", `/api/comments/${commentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/testimonies/${testimonyId}/comments`] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete comment",
      });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/testimonies/${testimonyId}/comments`, {
        content,
        parentId: comment.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/testimonies/${testimonyId}/comments`] });
      setReplyContent("");
      setShowReplyForm(false);
      toast({
        title: "Reply posted",
        description: "Your reply has been added.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          variant: "destructive",
          title: "Please sign in",
          description: "You need to be signed in to reply to comments.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to post reply",
        });
      }
    },
  });

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      replyMutation.mutate(replyContent);
    }
  };

  const maxDepth = 3;

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-border pl-4' : ''} py-3`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user?.profileImageUrl || undefined} />
          <AvatarFallback>{getInitials(comment.user?.firstName, comment.user?.lastName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm" data-testid={`comment-author-${comment.id}`}>
              {comment.user?.firstName} {comment.user?.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt!), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm mb-2" data-testid={`comment-content-${comment.id}`}>{comment.content}</p>
          <div className="flex gap-2">
            {isAuthenticated && depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowReplyForm(!showReplyForm)}
                data-testid={`button-reply-${comment.id}`}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            {user?.id === comment.userId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive"
                onClick={() => deleteMutation.mutate(comment.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-comment-${comment.id}`}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="mb-2"
                data-testid={`textarea-reply-${comment.id}`}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim() || replyMutation.isPending}
                  data-testid={`button-submit-reply-${comment.id}`}
                >
                  {replyMutation.isPending ? "Posting..." : "Post Reply"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                  data-testid={`button-cancel-reply-${comment.id}`}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  testimonyId={testimonyId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ testimonyId }: CommentSectionProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [commentContent, setCommentContent] = useState("");

  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: [`/api/testimonies/${testimonyId}/comments`],
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/testimonies/${testimonyId}/comments`, {
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/testimonies/${testimonyId}/comments`] });
      setCommentContent("");
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          variant: "destructive",
          title: "Please sign in",
          description: "You need to be signed in to comment.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to post comment",
        });
      }
    },
  });

  const handleSubmit = () => {
    if (commentContent.trim()) {
      commentMutation.mutate(commentContent);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      {isAuthenticated && (
        <div className="mb-6">
          <Textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Share your thoughts or encouragement..."
            className="mb-2"
            data-testid="textarea-comment"
          />
          <Button
            onClick={handleSubmit}
            disabled={!commentContent.trim() || commentMutation.isPending}
            data-testid="button-submit-comment"
          >
            {commentMutation.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      )}

      {!isAuthenticated && (
        <p className="text-sm text-muted-foreground mb-6">
          Please sign in to leave a comment.
        </p>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} testimonyId={testimonyId} />
          ))}
        </div>
      )}
    </div>
  );
}
