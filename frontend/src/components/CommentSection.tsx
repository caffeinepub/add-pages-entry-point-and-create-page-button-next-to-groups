import React, { useState, useRef, useEffect } from 'react';
import { Heart, MoreHorizontal, Reply, Edit2, Trash2, Flag, Send, Loader2 } from 'lucide-react';
import { Comment } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCommentsByPost,
  useAddComment,
  useEditComment,
  useDeleteComment,
  useLikeComment,
} from '../hooks/useQueries';
import { getBackendErrorMessage } from '../utils/backendErrors';
import { toast } from 'sonner';

interface CommentSectionProps {
  postId: string;
}

function formatRelativeTime(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ms).toLocaleDateString();
}

function shortenPrincipal(p: string): string {
  if (p.length <= 14) return p;
  return p.slice(0, 6) + '...' + p.slice(-4);
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  currentUserPrincipal: string | null;
  postId: string;
  depth?: number;
}

function CommentItem({ comment, replies, currentUserPrincipal, postId, depth = 0 }: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const editComment = useEditComment();
  const deleteComment = useDeleteComment();
  const likeComment = useLikeComment();
  const addComment = useAddComment();

  const isAuthor = currentUserPrincipal && comment.authorId.toString() === currentUserPrincipal;
  const isLiked = currentUserPrincipal
    ? comment.likes.some((l) => l.toString() === currentUserPrincipal)
    : false;
  const likeCount = comment.likes.length;

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      toast.error('Comment cannot be empty');
      return;
    }
    try {
      await editComment.mutateAsync({ commentId: comment.id, newContent: trimmed, postId });
      setIsEditing(false);
      toast.success('Comment updated');
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setShowMenu(false);
    try {
      await deleteComment.mutateAsync({ commentId: comment.id, postId });
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  const handleLike = async () => {
    if (!currentUserPrincipal) {
      toast.error('Please log in to like comments');
      return;
    }
    try {
      await likeComment.mutateAsync({ commentId: comment.id, postId });
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  const handleReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    if (!currentUserPrincipal) {
      toast.error('Please log in to reply');
      return;
    }
    try {
      await addComment.mutateAsync({ postId, content: trimmed, parentCommentId: comment.id });
      setReplyText('');
      setShowReplyInput(false);
      toast.success('Reply added');
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  const handleReport = () => {
    setShowMenu(false);
    toast.info('Report feature coming soon');
  };

  return (
    <div className={`flex gap-2.5 ${depth > 0 ? 'ml-8 mt-2' : 'mt-3'}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0 mt-0.5">
        {comment.authorId.toString().slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        {/* Comment bubble */}
        <div className="bg-muted/60 rounded-2xl px-3 py-2">
          <p className="text-xs font-semibold text-foreground mb-0.5">
            {shortenPrincipal(comment.authorId.toString())}
          </p>

          {isEditing ? (
            <div className="flex flex-col gap-2 mt-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full text-sm bg-background border border-border rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={editComment.isPending}
                  className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-60"
                >
                  {editComment.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : null}
                  Save
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditText(comment.content); }}
                  className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
            {comment.updatedAt ? ' · edited' : ''}
          </span>

          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={likeComment.isPending}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
              isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            } disabled:opacity-60`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {/* Reply button */}
          {currentUserPrincipal && depth === 0 && (
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>
          )}

          {/* Three-dot menu */}
          <div className="relative ml-auto" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 bg-card border border-border rounded-xl shadow-lg z-50 min-w-[130px] overflow-hidden">
                {isAuthor ? (
                  <>
                    <button
                      onClick={() => { setShowMenu(false); setIsEditing(true); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteComment.isPending}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deleteComment.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleReport}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-muted transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" /> Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reply input */}
        {showReplyInput && currentUserPrincipal && (
          <div className="flex gap-2 mt-2 ml-1">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0 mt-1">
              {currentUserPrincipal.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 flex gap-1.5">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 text-sm bg-muted/60 border border-border rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleReply();
                  }
                }}
              />
              <button
                onClick={handleReply}
                disabled={addComment.isPending || !replyText.trim()}
                className="p-1.5 rounded-full bg-primary text-primary-foreground disabled:opacity-50 flex-shrink-0"
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

        {/* Nested replies */}
        {replies.length > 0 && (
          <div>
            {replies.map((reply) => (
              <CommentItem
                key={reply.id.toString()}
                comment={reply}
                replies={[]}
                currentUserPrincipal={currentUserPrincipal}
                postId={postId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { identity } = useInternetIdentity();
  const [newComment, setNewComment] = useState('');
  const currentUserPrincipal = identity ? identity.getPrincipal().toString() : null;

  const { data: comments = [], isLoading } = useGetCommentsByPost(postId);
  const addComment = useAddComment();

  // Separate top-level comments and replies
  const topLevelComments = comments.filter((c) => !c.parentCommentId);
  const getReplies = (commentId: bigint) =>
    comments.filter(
      (c) => c.parentCommentId !== undefined && c.parentCommentId !== null && c.parentCommentId === commentId
    );

  const handleSubmit = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    if (!currentUserPrincipal) {
      toast.error('Please log in to comment');
      return;
    }
    try {
      await addComment.mutateAsync({ postId, content: trimmed, parentCommentId: null });
      setNewComment('');
      toast.success('Comment posted');
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  return (
    <div className="px-4 pb-4 border-t border-border/50 pt-3">
      {/* New comment input */}
      <div className="flex gap-2.5 items-start">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0 mt-0.5">
          {currentUserPrincipal ? currentUserPrincipal.slice(0, 2).toUpperCase() : '?'}
        </div>
        <div className="flex-1 flex gap-1.5">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={currentUserPrincipal ? 'Write a comment...' : 'Log in to comment'}
            disabled={!currentUserPrincipal || addComment.isPending}
            className="flex-1 text-sm bg-muted/60 border border-border rounded-full px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground disabled:opacity-60"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!currentUserPrincipal || addComment.isPending || !newComment.trim()}
            className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50 flex-shrink-0 transition-opacity"
            aria-label="Post comment"
          >
            {addComment.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : topLevelComments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div>
          {topLevelComments
            .slice()
            .sort((a, b) => Number(b.createdAt - a.createdAt))
            .map((comment) => (
              <CommentItem
                key={comment.id.toString()}
                comment={comment}
                replies={getReplies(comment.id)}
                currentUserPrincipal={currentUserPrincipal}
                postId={postId}
                depth={0}
              />
            ))}
        </div>
      )}
    </div>
  );
}
