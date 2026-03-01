import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetComments,
  useAddComment,
  useEditComment,
  useDeleteComment,
  useLikeComment,
  useUnlikeComment,
} from '../hooks/useQueries';
import ReportModal from './ReportModal';
import type { Comment } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart,
  MoreVertical,
  Pencil,
  Trash2,
  Flag,
  Reply,
  Loader2,
  Send,
} from 'lucide-react';

interface CommentSectionProps {
  postId: string;
}

function timeAgo(timestamp: bigint | number): string {
  const now = Date.now();
  const t = Number(timestamp);
  const diff = Math.floor((now - (t > 1e15 ? t / 1_000_000 : t)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getInitials(principal: string): string {
  return principal.slice(0, 2).toUpperCase();
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  allComments: Comment[];
  depth?: number;
}

function CommentItem({ comment, postId, allComments, depth = 0 }: CommentItemProps) {
  const { identity } = useInternetIdentity();
  const editComment = useEditComment();
  const deleteComment = useDeleteComment();
  const likeComment = useLikeComment();
  const unlikeComment = useUnlikeComment();
  const addComment = useAddComment();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const currentPrincipal = identity?.getPrincipal().toString();
  const isOwner =
    currentPrincipal && comment.authorId.toString() === currentPrincipal;
  const isAuthenticated = !!identity;

  const likeCount = comment.likes ? comment.likes.length : 0;
  const isLiked = currentPrincipal
    ? (comment.likes ?? []).some((p: any) => p.toString() === currentPrincipal)
    : false;

  const replies = allComments.filter((c) => {
    if (c.isDeleted) return false;
    const pid = c.parentCommentId;
    if (pid === null || pid === undefined) return false;
    if (Array.isArray(pid)) {
      return pid.length > 0 && Number(pid[0]) === Number(comment.id);
    }
    return Number(pid) === Number(comment.id);
  });

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await editComment.mutateAsync({
        commentId: BigInt(comment.id),
        content: editContent,
        postId,
      });
      setIsEditing(false);
    } catch {
      // handled by mutation
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment.mutateAsync({ commentId: BigInt(comment.id), postId });
    } catch {
      // handled by mutation
    }
    setDeleteDialogOpen(false);
  };

  const handleLike = async () => {
    if (!isAuthenticated) return;
    if (isLiked) {
      await unlikeComment.mutateAsync({ commentId: BigInt(comment.id), postId });
    } else {
      await likeComment.mutateAsync({ commentId: BigInt(comment.id), postId });
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    try {
      await addComment.mutateAsync({
        postId,
        content: replyContent,
        parentCommentId: BigInt(comment.id),
      });
      setReplyContent('');
      setIsReplying(false);
    } catch {
      // handled by mutation
    }
  };

  if (comment.isDeleted) {
    return (
      <div className={`${depth > 0 ? 'ml-8 border-l-2 border-border/30 pl-3' : ''}`}>
        <p className="text-xs text-muted-foreground italic py-1">Comment deleted</p>
      </div>
    );
  }

  return (
    <>
      <div className={`${depth > 0 ? 'ml-8 border-l-2 border-border/30 pl-3' : ''}`}>
        <div className="flex gap-2 py-2">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
            {getInitials(comment.authorId.toString())}
          </div>

          <div className="flex-1 min-w-0">
            {/* Author + time */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">
                  {comment.authorId.toString().slice(0, 10)}...
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(comment.createdAt)}
                </span>
                {comment.updatedAt && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">(edited)</span>
                )}
              </div>

              {/* Three-dot menu — portal-based to avoid overflow clipping */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full flex-shrink-0"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent
                    align="end"
                    side="bottom"
                    sideOffset={4}
                    collisionPadding={8}
                    className="w-36 z-[9999]"
                  >
                    {isOwner ? (
                      <>
                        <DropdownMenuItem
                          onClick={() => setIsEditing(true)}
                          className="gap-2 text-xs"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteDialogOpen(true)}
                          className="gap-2 text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => setReportOpen(true)}
                        className="gap-2 text-xs"
                      >
                        <Flag className="w-3 h-3" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </div>

            {/* Content or Edit form */}
            {isEditing ? (
              <div className="mt-1 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="text-sm resize-none min-h-[60px]"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={editComment.isPending || !editContent.trim()}
                    className="h-7 text-xs"
                  >
                    {editComment.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Save'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground mt-0.5 leading-relaxed">
                {comment.content}
              </p>
            )}

            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={handleLike}
                  disabled={!isAuthenticated}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    isLiked
                      ? 'text-red-500'
                      : 'text-muted-foreground hover:text-red-500'
                  } disabled:opacity-50`}
                >
                  <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                  {likeCount > 0 && <span>{likeCount}</span>}
                </button>
                {isAuthenticated && depth < 2 && (
                  <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Reply className="w-3 h-3" />
                    Reply
                  </button>
                )}
              </div>
            )}

            {/* Reply form */}
            {isReplying && (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="text-sm resize-none min-h-[60px]"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={addComment.isPending || !replyContent.trim()}
                    className="h-7 text-xs gap-1"
                  >
                    {addComment.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        Reply
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyContent('');
                    }}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nested replies */}
        {replies.length > 0 && depth < 2 && (
          <div className="mt-1">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id.toString()}
                comment={reply}
                postId={postId}
                allComments={allComments}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteComment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="comment"
        targetId={Number(comment.id)}
      />
    </>
  );
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { identity } = useInternetIdentity();
  const { data: comments = [], isLoading } = useGetComments(postId);
  const addComment = useAddComment();

  const [newComment, setNewComment] = useState('');

  const topLevelComments = (comments as Comment[]).filter((c) => {
    if (c.isDeleted) return false;
    const pid = c.parentCommentId;
    if (pid === null || pid === undefined) return true;
    if (Array.isArray(pid)) return pid.length === 0;
    return false;
  });

  const handleAddComment = async () => {
    if (!newComment.trim() || !identity) return;
    try {
      await addComment.mutateAsync({ postId, content: newComment.trim() });
      setNewComment('');
    } catch {
      // handled by mutation
    }
  };

  return (
    <div className="mt-3 border-t border-border/50 pt-3">
      {/* Add comment */}
      {identity && (
        <div className="flex gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
            {identity.getPrincipal().toString().slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              placeholder="Write a comment..."
              className="flex-1 bg-muted/50 rounded-xl px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={addComment.isPending}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || addComment.isPending}
              className="p-1.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {addComment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : topLevelComments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          No comments yet. Be the first!
        </p>
      ) : (
        <div>
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id.toString()}
              comment={comment}
              postId={postId}
              allComments={comments as Comment[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
