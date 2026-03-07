import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Loader2, Save, User } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUpdatePost } from "../hooks/useQueries";
import type { Post } from "../types";

interface EditPostModalProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function timeAgo(timestamp: bigint | number): string {
  const now = Date.now();
  const postTime = Number(timestamp) / 1_000_000;
  const diff = Math.floor((now - postTime) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function EditPostModal({
  post,
  open,
  onOpenChange,
}: EditPostModalProps) {
  const [text, setText] = useState("");
  const updatePost = useUpdatePost();

  // Pre-fill with current post text when modal opens
  useEffect(() => {
    if (post && open) {
      setText(post.content.text ?? "");
    }
  }, [post, open]);

  const handleClose = () => {
    if (updatePost.isPending) return;
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!post) return;
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Post text cannot be empty");
      return;
    }

    try {
      // Text-only edit — preserve existing media from the post
      const content = {
        text: trimmed,
        image: post.content.image ?? null,
        video: post.content.video ?? null,
      };

      await updatePost.mutateAsync({ postId: post.id, content });
      onOpenChange(false);
    } catch {
      // error handled by mutation's onError
    }
  };

  if (!post) return null;

  const authorDisplay = post.author.toString();
  const shortAuthor = `${authorDisplay.slice(0, 8)}...${authorDisplay.slice(-4)}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-lg w-full rounded-2xl mx-auto animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Edit Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Read-only author & timestamp info */}
          <div className="flex items-center gap-4 px-3 py-2.5 bg-muted/40 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-mono">{shortAuthor}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{timeAgo(post.timestamp)}</span>
            </div>
          </div>

          {/* Editable text content */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-post-content"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Content
            </label>
            <Textarea
              id="edit-post-content"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[120px] resize-none text-sm rounded-xl focus:ring-2 focus:ring-primary/30"
              disabled={updatePost.isPending}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Only text content can be edited. Media attachments are preserved.
            </p>
          </div>

          {/* Show existing media as read-only preview */}
          {post.content.image && (
            <div className="relative rounded-xl overflow-hidden border border-border/50">
              <img
                src={(post.content.image as any).getDirectURL?.() ?? ""}
                alt="Attached media"
                className="w-full max-h-40 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-1.5">
                <p className="text-xs text-white/80">
                  Image attachment (cannot be changed)
                </p>
              </div>
            </div>
          )}
          {post.content.video && (
            <div className="relative rounded-xl overflow-hidden border border-border/50">
              <video
                src={(post.content.video as any).getDirectURL?.() ?? ""}
                className="w-full max-h-40"
                muted
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-1.5">
                <p className="text-xs text-white/80">
                  Video attachment (cannot be changed)
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={updatePost.isPending}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!text.trim() || updatePost.isPending}
            className="min-h-[44px] gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {updatePost.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
