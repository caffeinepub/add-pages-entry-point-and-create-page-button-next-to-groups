import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useCreateDiscussion } from "../hooks/useQueries";

// Local type since backend DiscussionCategory is not exported as a TS enum we can use directly
type DiscussionCategory = "policy" | "governance" | "economy" | "socialIssues";

interface CreateDiscussionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES: { value: DiscussionCategory; label: string }[] = [
  { value: "policy", label: "Policy" },
  { value: "governance", label: "Governance" },
  { value: "economy", label: "Economy" },
  { value: "socialIssues", label: "Social Issues" },
];

export default function CreateDiscussionModal({
  open,
  onOpenChange,
}: CreateDiscussionModalProps) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState<DiscussionCategory>("policy");

  const createDiscussion = useCreateDiscussion();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    try {
      await createDiscussion.mutateAsync({ title, context, region, category });
      toast.success("Discussion created!");
      onOpenChange(false);
      setTitle("");
      setContext("");
      setRegion("");
    } catch {
      toast.info("Discussion creation is coming soon!");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Start a Discussion</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as DiscussionCategory)
              }
              className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Discussion title"
              className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label
              htmlFor="context"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Context
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide context for the discussion..."
              className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
            />
          </div>
          <div>
            <label
              htmlFor="region"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Region
            </label>
            <input
              id="region"
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. Maharashtra, India"
              className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createDiscussion.isPending || !title.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {createDiscussion.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating...
              </>
            ) : (
              "Start Discussion"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
