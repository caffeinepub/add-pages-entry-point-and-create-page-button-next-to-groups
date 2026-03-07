import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Image, Loader2, Send, Video, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type MediaContent, PostType } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreatePost } from "../hooks/useQueries";
import { formatBackendError } from "../utils/backendErrors";

export default function QuickPostBar() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const createPost = useCreatePost();

  const isActorReady = !!actor && !actorFetching;
  const isAuthenticated = !!identity;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setVideoFile(null);
    setVideoPreview(null);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setImageFile(null);
    setImagePreview(null);
    setVideoPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(null);
    setVideoPreview(null);
    setUploadProgress(0);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const resetForm = () => {
    setText("");
    clearMedia();
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imageFile && !videoFile) {
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
      let videoBlob: ExternalBlob | undefined;

      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      }

      if (videoFile) {
        const bytes = new Uint8Array(await videoFile.arrayBuffer());
        videoBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      }

      const content: MediaContent = {
        text: text.trim() || undefined,
        image: imageBlob,
        video: videoBlob,
      };

      await createPost.mutateAsync({
        content,
        groupId: null,
        postType: PostType.regular,
      });

      handleClose();
      window.dispatchEvent(new CustomEvent("postCreated"));
    } catch (error: unknown) {
      const msg = formatBackendError(error);
      toast.error(msg);
    }
  };

  return (
    <>
      {/* Trigger bar */}
      <button
        type="button"
        onClick={() => {
          if (!isAuthenticated) {
            toast.error("Please log in to create a post.");
            return;
          }
          setOpen(true);
        }}
        className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 text-muted-foreground text-sm hover:bg-muted/50 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Send size={14} className="text-primary" />
        </div>
        <span>What's on your mind?</span>
      </button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) handleClose();
          else setOpen(true);
        }}
      >
        <DialogContent className="max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <textarea
              className="w-full bg-muted/40 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[100px]"
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={createPost.isPending}
            />

            {(imagePreview || videoPreview) && (
              <div className="relative rounded-xl overflow-hidden">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-56 object-cover rounded-xl"
                  />
                )}
                {videoPreview && (
                  <video
                    src={videoPreview}
                    className="w-full max-h-56 rounded-xl"
                    controls
                  >
                    <track kind="captions" />
                  </video>
                )}
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
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoChange}
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
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={createPost.isPending || !isActorReady}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  <Video size={16} />
                  <span>Video</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  createPost.isPending ||
                  !isActorReady ||
                  (!text.trim() && !imageFile && !videoFile)
                }
                className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPost.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Posting…</span>
                  </>
                ) : !isActorReady ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Connecting…</span>
                  </>
                ) : (
                  <span>Post</span>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
