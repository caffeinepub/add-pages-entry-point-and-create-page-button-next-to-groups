import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Upload, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateGroup } from "../hooks/useQueries";
import { formatBackendError } from "../utils/backendErrors";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({
  open,
  onClose,
}: CreateGroupModalProps) {
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

  const handleClose = () => {
    setName("");
    setDescription("");
    clearCover();
    onClose();
  };

  const handleSubmit = async () => {
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
          setUploadProgress(pct),
        );
      }

      await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        coverImage: coverBlob,
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
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isActorReady && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              <Loader2 size={14} className="animate-spin" />
              <span>Connecting to network…</span>
            </div>
          )}

          <div>
            <label
              htmlFor="group-name"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Group Name <span className="text-destructive">*</span>
            </label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              disabled={createGroup.isPending}
              className="w-full bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="group-description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              disabled={createGroup.isPending}
              rows={3}
              className="w-full bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="group-cover"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Cover Image (optional)
            </label>
            {coverPreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={clearCover}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={createGroup.isPending}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-6 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
              >
                <Upload size={16} />
                <span>Upload cover image</span>
              </button>
            )}
            <input
              id="group-cover"
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>

          {createGroup.isPending &&
            uploadProgress > 0 &&
            uploadProgress < 100 && (
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={createGroup.isPending}
              className="flex-1 text-sm text-muted-foreground px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                createGroup.isPending ||
                !isActorReady ||
                !name.trim() ||
                !description.trim()
              }
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createGroup.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Creating…</span>
                </>
              ) : (
                <span>Create Group</span>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
