import React, { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateGroup } from "../hooks/useQueries";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ExternalBlob } from "../backend";
import { formatBackendError } from "../utils/backendErrors";

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const createGroup = useCreateGroup();

  const isActorReady = !!actor && !actorFetching;
  const isAuthenticated = !!identity;

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setUploadProgress(0);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a group name.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a group description.");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please log in to create a group.");
      return;
    }
    if (!isActorReady) {
      toast.error("Still connecting to the network. Please try again.");
      return;
    }

    try {
      let coverBlob: ExternalBlob | undefined;

      if (coverFile) {
        const bytes = new Uint8Array(await coverFile.arrayBuffer());
        coverBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct)
        );
      }

      await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        coverImage: coverBlob,
      });

      navigate({ to: "/communities" });
    } catch (error: unknown) {
      const msg = formatBackendError(error);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/communities" })}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Create Group</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isActorReady && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
              <Loader2 size={14} className="animate-spin" />
              <span>Connecting to network…</span>
            </div>
          )}

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Group Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              disabled={createGroup.isPending}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={4}
              disabled={createGroup.isPending}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cover Image (optional)
            </label>
            {coverPreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-40 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={clearCover}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={createGroup.isPending}
                className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
              >
                <Upload size={20} />
                <span>Upload cover image</span>
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>

          {createGroup.isPending && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={
              createGroup.isPending ||
              !isActorReady ||
              !name.trim() ||
              !description.trim()
            }
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createGroup.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Group…</span>
              </>
            ) : !isActorReady ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Connecting…</span>
              </>
            ) : (
              <span>Create Group</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
