import React, { useState, useRef } from 'react';
import { Image, Video, Send, X, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreatePost } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { getBackendErrorMessage } from '../utils/backendErrors';
import { toast } from 'sonner';

interface CreatePostCardProps {
  groupId?: bigint | null;
  onPostCreated?: () => void;
}

export default function CreatePostCard({ groupId = null, onPostCreated }: CreatePostCardProps) {
  const { identity } = useInternetIdentity();
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const createPost = useCreatePost();

  const handleMediaSelect = (file: File, type: 'image' | 'video') => {
    setMediaFile(file);
    setMediaType(type);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleMediaSelect(file, 'image');
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleMediaSelect(file, 'video');
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
      toast.error('Please add some text or media to your post');
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
        text: trimmed || undefined,
        image: imageBlob ?? undefined,
        video: videoBlob ?? undefined,
      };

      await createPost.mutateAsync({ content, groupId: groupId ?? null });

      toast.success('Post created successfully!');
      setText('');
      clearMedia();
      onPostCreated?.();
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  const canSubmit = (text.trim().length > 0 || !!mediaFile) && !createPost.isPending;

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-4 mb-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
          {identity ? identity.getPrincipal().toString().slice(0, 2).toUpperCase() : '?'}
        </div>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your civic thoughts..."
            className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
            disabled={createPost.isPending}
          />

          {/* Media Preview */}
          {mediaPreview && (
            <div className="relative mt-2 rounded-xl overflow-hidden">
              {mediaType === 'image' ? (
                <img src={mediaPreview} alt="Preview" className="w-full max-h-48 object-cover" />
              ) : (
                <video src={mediaPreview} controls className="w-full max-h-48" />
              )}
              <button
                onClick={clearMedia}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                aria-label="Remove media"
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

          {/* Actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
              onChange={handleVideoChange}
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
      </div>
    </div>
  );
}
