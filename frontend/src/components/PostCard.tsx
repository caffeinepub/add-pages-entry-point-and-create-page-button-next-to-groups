import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit, Flag, ChevronUp } from 'lucide-react';
import { Post } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLikePost, useUnlikePost, useHasLikedPost, useDeletePost } from '../hooks/useQueries';
import { getBackendErrorMessage } from '../utils/backendErrors';
import { toast } from 'sonner';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onReport?: (post: Post) => void;
}

function formatTime(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function shortenPrincipal(p: string): string {
  if (p.length <= 12) return p;
  return p.slice(0, 6) + '...' + p.slice(-4);
}

export default function PostCard({ post, onEdit, onReport }: PostCardProps) {
  const { identity } = useInternetIdentity();
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);

  const { data: hasLiked = false } = useHasLikedPost(post.id);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const deletePost = useDeletePost();

  const isLiked = optimisticLiked !== null ? optimisticLiked : hasLiked;
  const likeCount = optimisticCount !== null ? optimisticCount : Number(post.likeCount);

  const isAuthor = identity && post.author.toString() === identity.getPrincipal().toString();

  const handleLike = async () => {
    if (!identity) {
      toast.error('Please log in to like posts');
      return;
    }
    const prevLiked = isLiked;
    const prevCount = likeCount;
    // Optimistic update
    setOptimisticLiked(!prevLiked);
    setOptimisticCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      if (prevLiked) {
        await unlikePost.mutateAsync(post.id);
      } else {
        await likePost.mutateAsync(post.id);
      }
      // Reset optimistic after success (real data will come from query invalidation)
      setOptimisticLiked(null);
      setOptimisticCount(null);
    } catch (err) {
      // Revert optimistic update
      setOptimisticLiked(prevLiked);
      setOptimisticCount(prevCount);
      toast.error(getBackendErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setShowMenu(false);
    try {
      await deletePost.mutateAsync(post.id);
      toast.success('Post deleted');
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'CivWorld Post', text: post.content.text || '' }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success('Link copied to clipboard');
      });
    }
  };

  const imageUrl = post.content.image ? post.content.image.getDirectURL() : null;
  const videoUrl = post.content.video ? post.content.video.getDirectURL() : null;

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border mb-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {post.author.toString().slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">
              {shortenPrincipal(post.author.toString())}
            </p>
            <p className="text-xs text-muted-foreground">{formatTime(post.timestamp)}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-lg z-50 min-w-[140px] overflow-hidden">
              {isAuthor && (
                <>
                  {onEdit && (
                    <button
                      onClick={() => { setShowMenu(false); onEdit(post); }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-muted transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={deletePost.isPending}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deletePost.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
              {onReport && (
                <button
                  onClick={() => { setShowMenu(false); onReport(post); }}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-muted transition-colors"
                >
                  <Flag className="w-4 h-4" /> Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content.text && (
        <div className="px-4 pb-3">
          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {post.content.text}
          </p>
        </div>
      )}

      {/* Media */}
      {imageUrl && (
        <div className="w-full">
          <img
            src={imageUrl}
            alt="Post media"
            className="w-full max-h-80 object-cover"
          />
        </div>
      )}
      {videoUrl && (
        <div className="w-full">
          <video
            src={videoUrl}
            controls
            className="w-full max-h-80 object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 py-3 border-t border-border/50">
        <button
          onClick={handleLike}
          disabled={likePost.isPending || unlikePost.isPending}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            isLiked
              ? 'text-red-500 bg-red-50 dark:bg-red-950/30'
              : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
          } disabled:opacity-60`}
          aria-label={isLiked ? 'Unlike post' : 'Like post'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            showComments
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
          }`}
          aria-label={showComments ? 'Hide comments' : 'Show comments'}
        >
          {showComments ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <MessageCircle className="w-4 h-4" />
          )}
          <span>{showComments ? 'Hide' : 'Comment'}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          aria-label="Share post"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Comment Section - only rendered when toggled open */}
      {showComments && (
        <CommentSection postId={post.id.toString()} />
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
