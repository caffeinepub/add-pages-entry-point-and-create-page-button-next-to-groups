import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image, X, Loader2, Send } from 'lucide-react';
import { useCreatePost } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { getBackendErrorMessage } from '../utils/backendErrors';
import { toast } from 'sonner';

interface CreateGroupPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: bigint | number;
}

export default function CreateGroupPostModal({
  open,
  onOpenChange,
  groupId,
}: CreateGroupPostModalProps) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const createPost = useCreatePost();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleClose = () => {
    if (createPost.isPending) return;
    onOpenChange(false);
    setText('');
    clearImage();
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed && !imageFile) {
      toast.error('Please add some text or an image');
      return;
    }

    try {
      let imageBlob: ExternalBlob | null = null;
      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct)
        );
      }

      const content = {
        text: trimmed || null,
        image: imageBlob,
        video: null,
      };

      await createPost.mutateAsync({ content, groupId: Number(groupId) });
      toast.success('Post created!');
      onOpenChange(false);
      setText('');
      clearImage();
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Create Group Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share something with the group..."
            className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px]"
            disabled={createPost.isPending}
          />

          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-48 object-cover"
              />
              <button
                onClick={clearImage}
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

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={createPost.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
              >
                <Image className="w-4 h-4" />
                Photo
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={(!text.trim() && !imageFile) || createPost.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
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
  );
}
