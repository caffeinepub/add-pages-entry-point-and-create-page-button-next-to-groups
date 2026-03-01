import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLikePost, useUnlikePost, useDeletePost } from '../hooks/useQueries';
import type { Post } from '../types';
import CommentSection from './CommentSection';
import EditPostModal from './EditPostModal';
import ReportModal from './ReportModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Pencil,
  Trash2,
  Flag,
  Loader2,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  showComments?: boolean;
}

function timeAgo(timestamp: bigint | number): string {
  const now = Date.now();
  const postTime = Number(timestamp) / 1_000_000;
  const diff = Math.floor((now - postTime) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getInitials(principal: string): string {
  return principal.slice(0, 2).toUpperCase();
}

export default function PostCard({ post, showComments = false }: PostCardProps) {
  const { identity } = useInternetIdentity();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const deletePost = useDeletePost();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(post.likeCount));
  const [commentsOpen, setCommentsOpen] = useState(showComments);
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isAuthenticated = !!identity;
  const currentPrincipal = identity?.getPrincipal().toString();
  const isOwner =
    isAuthenticated && currentPrincipal != null && post.author.toString() === currentPrincipal;

  const handleLike = async () => {
    if (!isAuthenticated) return;
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      try {
        await unlikePost.mutateAsync(post.id);
      } catch {
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      try {
        await likePost.mutateAsync(post.id);
      } catch {
        setLiked(false);
        setLikeCount((c) => c - 1);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(post.id);
    } catch {
      // error handled by mutation
    }
    setDeleteDialogOpen(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'CivWorld Post', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const imageUrl = post.content.image
    ? (() => {
        try {
          return (post.content.image as any).getDirectURL?.() ?? null;
        } catch {
          return null;
        }
      })()
    : null;

  const videoUrl = post.content.video
    ? (() => {
        try {
          return (post.content.video as any).getDirectURL?.() ?? null;
        } catch {
          return null;
        }
      })()
    : null;

  // Check if post has been edited (new field from backend)
  const isEdited = (post as any).isEdited === true;

  return (
    <>
      <article className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-3">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {getInitials(post.author.toString())}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">
                {post.author.toString().slice(0, 12)}...
              </p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">{timeAgo(post.timestamp)}</p>
                {isEdited && (
                  <span className="text-xs text-muted-foreground/70 italic">· Edited</span>
                )}
              </div>
            </div>
          </div>

          {/* Three-dot menu — only show if authenticated */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {isOwner ? (
                  <>
                    <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2">
                      <Pencil className="w-4 h-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => setReportOpen(true)} className="gap-2">
                    <Flag className="w-4 h-4" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        {post.content.text && (
          <div className="px-4 pb-3">
            <p className="text-sm text-foreground leading-relaxed">{post.content.text}</p>
          </div>
        )}

        {imageUrl && (
          <div className="w-full">
            <img src={imageUrl} alt="Post media" className="w-full max-h-80 object-cover" />
          </div>
        )}

        {videoUrl && (
          <div className="w-full">
            <video src={videoUrl} controls className="w-full max-h-80 object-cover" />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 px-3 py-2 border-t border-border/50">
          <button
            onClick={handleLike}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
              liked
                ? 'text-red-500 bg-red-50 dark:bg-red-950/30'
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
            } disabled:opacity-50`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </button>

          <button
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Comment</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all min-h-[44px] ml-auto"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Comments */}
        {commentsOpen && (
          <div className="border-t border-border/50">
            <CommentSection postId={String(post.id)} />
          </div>
        )}
      </article>

      {/* Edit Modal — only for post owner */}
      {isOwner && editOpen && (
        <EditPostModal
          post={post}
          open={editOpen}
          onOpenChange={(v) => setEditOpen(v)}
        />
      )}

      {/* Report Modal — only for non-owners */}
      {!isOwner && (
        <ReportModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          targetType="post"
          targetId={Number(post.id)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePost.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
