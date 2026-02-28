import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image, Video, X, Loader2, Save } from 'lucide-react';
import type { Post } from '../types';
import { ExternalBlob } from '../backend';
import { useUpdatePost } from '../hooks/useQueries';
import { getBackendErrorMessage } from '../utils/backendErrors';
import { toast } from 'sonner';

interface EditPostModalProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPostModal({ post, open, onOpenChange }: EditPostModalProps) {
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const updatePost = useUpdatePost();

  useEffect(() => {
    if (post && open) {
      setText(post.content.text || '');
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType(null);
      setUploadProgress(0);
    }
  }, [post, open]);

  const handleMediaSelect = (file: File, type: 'image' | 'video') => {
    setMediaFile(file);
    setMediaType(type);
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setUploadProgress(0);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleClose = () => {
    if (updatePost.isPending) return;
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!post) return;
    const trimmed = text.trim();
    if (!trimmed && !mediaFile) {
      toast.error('Post must have text or media');
      return;
    }

    try {
      let imageBlob: ExternalBlob | null = null;
      let videoBlob: ExternalBlob | null = null;

      if (mediaFile && mediaType === 'image') {
        const bytes = new Uint8Array(await mediaFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct)
        );
      } else if (mediaFile && mediaType === 'video') {
        const bytes = new Uint8Array(await mediaFile.arrayBuffer());
        videoBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct)
        );
      }

      const content = {
        text: trimmed || null,
        image: imageBlob,
        video: videoBlob,
      };

      await updatePost.mutateAsync({ postId: post.id, content });
      toast.success('Post updated!');
      onOpenChange(false);
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  // Show existing media from post if no new file selected
  const existingImageUrl =
    !mediaFile && post?.content.image
      ? (post.content.image as any).getDirectURL?.()
      : null;
  const existingVideoUrl =
    !mediaFile && post?.content.video
      ? (post.content.video as any).getDirectURL?.()
      : null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px]"
            disabled={updatePost.isPending}
          />

          {/* Existing media */}
          {existingImageUrl && !mediaPreview && (
            <div className="relative rounded-xl overflow-hidden">
              <img src={existingImageUrl} alt="Current" className="w-full max-h-48 object-cover" />
              <p className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
                Current image — upload new to replace
              </p>
            </div>
          )}
          {existingVideoUrl && !mediaPreview && (
            <div className="relative rounded-xl overflow-hidden">
              <video src={existingVideoUrl} controls className="w-full max-h-48" />
            </div>
          )}

          {/* New media preview */}
          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden">
              {mediaType === 'image' ? (
                <img src={mediaPreview} alt="New preview" className="w-full max-h-48 object-cover" />
              ) : (
                <video src={mediaPreview} controls className="w-full max-h-48" />
              )}
              <button
                onClick={clearMedia}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
              {updatePost.isPending && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleMediaSelect(f, 'image');
                }}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleMediaSelect(f, 'video');
                }}
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={updatePost.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
              >
                <Image className="w-4 h-4" />
                Photo
              </button>
              <button
                onClick={() => videoInputRef.current?.click()}
                disabled={updatePost.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
              >
                <Video className="w-4 h-4" />
                Video
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={(!text.trim() && !mediaFile) || updatePost.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {updatePost.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
