import React, { useState, useRef } from "react";
import { Image, Video, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreatePost } from "../hooks/useQueries";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ExternalBlob, PostType, MediaContent } from "../backend";
import { formatBackendError } from "../utils/backendErrors";

interface CreatePostCardProps {
  onPostCreated?: () => void;
  groupId?: bigint;
}

export default function CreatePostCard({ onPostCreated, groupId }: CreatePostCardProps) {
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
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setImageFile(null);
    setImagePreview(null);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
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
          setUploadProgress(pct)
        );
      }

      if (videoFile) {
        const bytes = new Uint8Array(await videoFile.arrayBuffer());
        videoBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct)
        );
      }

      const content: MediaContent = {
        text: text.trim() || undefined,
        image: imageBlob,
        video: videoBlob,
      };

      await createPost.mutateAsync({
        content,
        groupId: groupId ?? null,
        postType: PostType.regular,
      });

      setText("");
      clearMedia();
      onPostCreated?.();
      // Dispatch event for pages listening to post creation
      window.dispatchEvent(new CustomEvent("postCreated"));
    } catch (error: unknown) {
      const msg = formatBackendError(error);
      toast.error(msg);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center text-muted-foreground text-sm">
        Log in to create a post
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <textarea
        className="w-full bg-muted/40 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[80px]"
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={createPost.isPending}
      />

      {/* Media preview */}
      {(imagePreview || videoPreview) && (
        <div className="relative rounded-xl overflow-hidden">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded-xl"
            />
          )}
          {videoPreview && (
            <video
              src={videoPreview}
              className="w-full max-h-64 rounded-xl"
              controls
            />
          )}
          <button
            onClick={clearMedia}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload progress */}
      {createPost.isPending && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
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
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
          onChange={handleVideoChange}
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={createPost.isPending || !isActorReady}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-muted disabled:opacity-50"
          >
            <Image size={16} />
            <span>Photo</span>
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={createPost.isPending || !isActorReady}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-muted disabled:opacity-50"
          >
            <Video size={16} />
            <span>Video</span>
          </button>
        </div>

        <button
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
  );
}
