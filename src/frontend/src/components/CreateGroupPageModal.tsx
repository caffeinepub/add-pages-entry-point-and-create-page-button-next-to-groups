import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Users } from "lucide-react";
import React from "react";

interface CreateGroupPageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateGroupPageModal({
  open,
  onOpenChange,
}: CreateGroupPageModalProps) {
  const navigate = useNavigate();

  const handleCreateGroup = () => {
    onOpenChange(false);
    navigate({ to: "/create-group" });
  };

  const handleCreatePage = () => {
    onOpenChange(false);
    navigate({ to: "/create-page" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Create</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleCreateGroup}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted/50 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Create Group</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Build a community around shared civic interests
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleCreatePage}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted/50 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Create Page</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share your civic mission with the community
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
