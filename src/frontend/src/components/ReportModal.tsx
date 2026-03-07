import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Flag, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useSubmitReport } from "../hooks/useQueries";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "post" | "comment" | "profile";
  targetId: number;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "hateSpeech", label: "Hate Speech" },
  { value: "misinformation", label: "Misinformation" },
  { value: "harassment", label: "Harassment" },
  { value: "inappropriateContent", label: "Inappropriate Content" },
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [duplicateError, setDuplicateError] = useState(false);
  const submitReport = useSubmitReport();

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setDuplicateError(false);
    try {
      await submitReport.mutateAsync({
        targetId,
        reason: selectedReason,
        details: description.trim(),
      });
      setSubmitted(true);
      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      const msg = String(err);
      if (
        msg.includes("already reported") ||
        msg.includes("Duplicate report")
      ) {
        setDuplicateError(true);
      }
      // Other errors are handled by the mutation's onError toast
    }
  };

  const handleClose = () => {
    if (submitReport.isPending) return;
    setSelectedReason("");
    setDescription("");
    setSubmitted(false);
    setDuplicateError(false);
    onClose();
  };

  const targetLabel =
    targetType === "post"
      ? "Post"
      : targetType === "comment"
        ? "Comment"
        : "Profile";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm w-full mx-auto rounded-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Flag className="w-4 h-4 text-destructive flex-shrink-0" />
            Report {targetLabel}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Report submitted successfully
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Our admin team will review your report shortly.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-1">
              <p className="text-sm text-muted-foreground">
                Why are you reporting this {targetType}? Your report will be
                reviewed by our admin team.
              </p>

              {/* Reason dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Reason <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedReason}
                  onValueChange={setSelectedReason}
                >
                  <SelectTrigger className="w-full min-h-[44px] rounded-xl">
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Optional description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Additional Details{" "}
                  <span className="text-muted-foreground/60 normal-case">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  placeholder="Provide more context about this report..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm resize-none rounded-xl min-h-[80px]"
                  rows={3}
                  disabled={submitReport.isPending}
                />
              </div>

              {/* Duplicate error message */}
              {duplicateError && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <Flag className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    You have already reported this content. Duplicate reports
                    are not allowed.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 pt-1">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={submitReport.isPending}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={!selectedReason || submitReport.isPending}
                className="min-h-[44px] gap-2"
              >
                {submitReport.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
