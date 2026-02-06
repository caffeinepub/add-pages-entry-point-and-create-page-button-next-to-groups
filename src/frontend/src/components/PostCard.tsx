import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Flag, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLikePost, useAddComment, useGetPostComments, useGetUserProfile, useDeletePost, useDeleteComment } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Post, Comment } from '../types';
import BadgeDisplay from './BadgeDisplay';
import VerifiedBadge from './VerifiedBadge';
import EditPostModal from './EditPostModal';
import ReportModal from './ReportModal';
import { toast } from 'sonner';
import { PostType } from '../backend';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { identity } = useInternetIdentity();
  const likePost = useLikePost();
  const addComment = useAddComment();
  const deletePost = useDeletePost();
  const { data: comments = [] } = useGetPostComments(post.id);
  const { data: authorProfile } = useGetUserProfile(post.author);

  const isAuthor = identity?.getPrincipal().toString() === post.author.toString();
  const isNewsFeed = post.postType === PostType.newsFeed;

  const handleLike = async () => {
    try {
      await likePost.mutateAsync(post.id);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      await addComment.mutateAsync({
        postId: post.id,
        content: commentText,
      });
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async () => {
    if (deletePost.isPending) return;
    
    try {
      await deletePost.mutateAsync(post.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleShare = () => {
    toast.success('Share functionality coming soon!');
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Post Header */}
        <div className="flex items-start justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {authorProfile?.profilePhoto ? (
                <AvatarImage src={authorProfile.profilePhoto.getDirectURL()} alt={authorProfile.name} />
              ) : (
                <AvatarFallback>{authorProfile?.name?.[0] || 'U'}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{authorProfile?.name || 'Anonymous'}</span>
                {authorProfile?.verifiedStatus && <VerifiedBadge size="sm" />}
                {isNewsFeed && (
                  <Badge variant="default" className="bg-[oklch(0.45_0.12_250)] text-white text-xs gap-1">
                    <BadgeCheck className="h-3 w-3" />
                    News
                  </Badge>
                )}
                {authorProfile?.badges && authorProfile.badges.length > 0 && (
                  <BadgeDisplay badges={authorProfile.badges} size="sm" maxDisplay={2} />
                )}
              </div>
              <span className="text-xs text-muted-foreground">{formatTimestamp(post.timestamp)}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-[oklch(0.45_0.12_250)]"
              >
                <MoreVertical className="h-5 w-5 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-[oklch(0.70_0.02_250)]">
              {isAuthor && (
                <>
                  <DropdownMenuItem 
                    onClick={() => setShowEditModal(true)}
                    className="cursor-pointer focus:bg-muted focus:text-foreground"
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)} 
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                onClick={() => setShowReportModal(true)} 
                className="cursor-pointer text-[oklch(0.45_0.12_25)] focus:bg-[oklch(0.45_0.12_25)]/10 focus:text-[oklch(0.45_0.12_25)]"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Text Content */}
        {post.content.text && (
          <div className="px-4 pb-3">
            <p className="text-sm whitespace-pre-wrap">{post.content.text}</p>
          </div>
        )}

        {/* Post Media - Full Width Inline Display */}
        {post.content.image && (
          <div className="w-full bg-muted">
            <img
              src={post.content.image.getDirectURL()}
              alt="Post content"
              className="w-full h-auto max-h-[600px] object-contain"
            />
          </div>
        )}

        {post.content.video && (
          <div className="w-full bg-black">
            <video
              src={post.content.video.getDirectURL()}
              controls
              className="w-full h-auto max-h-[600px]"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-center gap-6 py-3 px-4 border-t border-border">
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleLike} disabled={likePost.isPending}>
            <Heart className="h-4 w-4" />
            <span className="text-sm">{Number(post.likeCount)}</span>
          </Button>

          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowComments(!showComments)}>
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{comments.length}</span>
          </Button>

          <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="text-sm">Share</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
            {comments.map((comment, index) => (
              <CommentItem key={index} comment={comment} postId={post.id} />
            ))}

            <div className="flex gap-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                className="resize-none"
              />
              <Button onClick={handleComment} disabled={!commentText.trim() || addComment.isPending}>
                {addComment.isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white z-[10000]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Post</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this post? This action cannot be undone and will remove all comments and likes associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePost.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={deletePost.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deletePost.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Post Modal */}
      <EditPostModal post={post} isOpen={showEditModal} onClose={() => setShowEditModal(false)} />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="post"
        targetId={post.id}
      />
    </>
  );
}

interface CommentItemProps {
  comment: Comment;
  postId: bigint;
}

function CommentItem({ comment, postId }: CommentItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: commenterProfile } = useGetUserProfile(comment.author);
  const deleteComment = useDeleteComment();

  const isCommentAuthor = identity?.getPrincipal().toString() === comment.author.toString();

  const handleDeleteComment = async () => {
    try {
      await deleteComment.mutateAsync(postId);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <>
      <div className="flex gap-2 group">
        <Avatar className="h-8 w-8 flex-shrink-0">
          {commenterProfile?.profilePhoto ? (
            <AvatarImage src={commenterProfile.profilePhoto.getDirectURL()} alt={commenterProfile.name} />
          ) : (
            <AvatarFallback>{commenterProfile?.name?.[0] || 'U'}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 bg-muted rounded-lg p-2 relative">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-xs">{commenterProfile?.name || 'Anonymous'}</span>
                {commenterProfile?.verifiedStatus && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-[oklch(0.45_0.12_250)]"
                >
                  <MoreVertical className="h-4 w-4 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 border-[oklch(0.70_0.02_250)]">
                {isCommentAuthor && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)} 
                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem 
                  onClick={() => setShowReportModal(true)} 
                  className="cursor-pointer text-[oklch(0.45_0.12_25)] focus:bg-[oklch(0.45_0.12_25)]/10 focus:text-[oklch(0.45_0.12_25)]"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Delete Comment Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white z-[10000]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Comment</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteComment.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteComment} 
              disabled={deleteComment.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteComment.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Comment Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="comment"
        targetId={postId}
      />
    </>
  );
}
