import React, { useState, useRef } from 'react';
import { Image, Video, Send, X, Loader2, PenSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreatePost } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { getBackendErrorMessage } from '../utils/backendErrors';
import { toast } from 'sonner';

interface QuickPostBarProps {
  groupId?: bigint | number | null;
  onPostCreated?: () => void;
}

export default function QuickPostBar({ groupId = null, onPostCreated }: QuickPostBarProps) {
  const { identity } = useInternetIdentity();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const createPost = useCreatePost();

  const handleOpen = () => {
    if (!identity) {
      toast.error('Please log in to create a post');
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    if (createPost.isPending) return;
    setOpen(false);
    setText('');
    clearMedia();
  };

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

  const handleSubmit = async () => {
    if (!identity) {
      toast.error('Please log in to create a post');
      return;
    }
    const trimmed = text.trim();
    if (!trimmed && !mediaFile) {
      toast.error('Please add some text or media');
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

      const numGroupId =
        groupId !== null && groupId !== undefined ? Number(groupId) : undefined;

      await createPost.mutateAsync({ content, groupId: numGroupId });

      setOpen(false);
      setText('');
      clearMedia();
      onPostCreated?.();
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  const canSubmit = (text.trim().length > 0 || !!mediaFile) && !createPost.isPending;

  return (
    <>
      {/* Trigger bar */}
      <button
        onClick={handleOpen}
        className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 mb-4 shadow-sm hover:bg-muted/50 transition-all text-left"
      >
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
          {identity ? identity.getPrincipal().toString().slice(0, 2).toUpperCase() : '?'}
        </div>
        <span className="text-muted-foreground text-sm flex-1">What's on your mind?</span>
        <PenSquare className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-lg mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your civic thoughts..."
              className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px]"
              disabled={createPost.isPending}
              autoFocus
            />

            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative rounded-xl overflow-hidden">
                {mediaType === 'image' ? (
                  <img src={mediaPreview} alt="Preview" className="w-full max-h-48 object-cover" />
                ) : (
                  <video src={mediaPreview} controls className="w-full max-h-48" />
                )}
                <button
                  onClick={clearMedia}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
                {createPost.isPending && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Media buttons */}
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
                  disabled={createPost.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
                >
                  <Image className="w-4 h-4" />
                  Photo
                </button>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  disabled={createPost.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
                >
                  <Video className="w-4 h-4" />
                  Video
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPost.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
