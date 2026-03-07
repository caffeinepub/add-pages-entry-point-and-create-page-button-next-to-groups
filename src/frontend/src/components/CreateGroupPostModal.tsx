import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Image, Loader2, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type MediaContent, PostType } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreatePost } from "../hooks/useQueries";
import { formatBackendError } from "../utils/backendErrors";

interface CreateGroupPostModalProps {
  open: boolean;
  onClose: () => void;
  groupId: number;
}

export default function CreateGroupPostModal({
  open,
  onClose,
  groupId,
}: CreateGroupPostModalProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const createPost = useCreatePost();

  const isActorReady = !!actor && !actorFetching;
  const isAuthenticated = !!identity;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleClose = () => {
    setText("");
    clearMedia();
    onClose();
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imageFile) {
      toast.error("Please add some content to your post.");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please log in to create a post.");
      return;
    }
    if (!isActorReady) {
      toast.error("Still connecting to the network. Please try again.");
      return;
    }

    try {
      let imageBlob: ExternalBlob | undefined;

      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      }

      const content: MediaContent = {
        text: text.trim() || undefined,
        image: imageBlob,
        video: undefined,
      };

      await createPost.mutateAsync({
        content,
        groupId: BigInt(groupId),
        postType: PostType.regular,
      });

      handleClose();
    } catch (error: unknown) {
      const msg = formatBackendError(error);
      toast.error(msg);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle>Create Group Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {!isActorReady && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              <Loader2 size={14} className="animate-spin" />
              <span>Connecting to network…</span>
            </div>
          )}

          <textarea
            className="w-full bg-muted/40 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[100px]"
            placeholder="Share something with the group…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={createPost.isPending}
          />

          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-56 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={clearMedia}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {createPost.isPending &&
            uploadProgress > 0 &&
            uploadProgress < 100 && (
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={createPost.isPending || !isActorReady}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-muted disabled:opacity-50"
              >
                <Image size={16} />
                <span>Photo</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={createPost.isPending}
                className="text-sm text-muted-foreground px-4 py-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  createPost.isPending ||
                  !isActorReady ||
                  (!text.trim() && !imageFile)
                }
                className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPost.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Posting…</span>
                  </>
                ) : (
                  <span>Post</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
