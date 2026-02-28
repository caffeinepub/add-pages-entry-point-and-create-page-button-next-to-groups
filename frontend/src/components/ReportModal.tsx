import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitReport } from '../hooks/useQueries';
// Use regular import (not import type) so enums can be used as values
import { ReportReason, ReportTargetType } from '../types';
import { Loader2, Flag } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'post' | 'comment' | 'profile';
  targetId: number;
}

const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'misinformation', label: 'Fake News / Misinformation' },
  { value: 'inappropriateContent', label: 'Abusive Content' },
  { value: 'harassment', label: 'Political Misinformation / Harassment' },
  { value: 'other', label: 'Other' },
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const submitReport = useSubmitReport();

  const getTargetTypeBackend = (): ReportTargetType => {
    if (targetType === 'post') return ReportTargetType.post;
    if (targetType === 'comment') return ReportTargetType.comment;
    return ReportTargetType.profile;
  };

  const getReasonBackend = (): ReportReason => {
    switch (selectedReason) {
      case 'spam':
        return ReportReason.spam;
      case 'misinformation':
        return ReportReason.misinformation;
      case 'inappropriateContent':
        return ReportReason.inappropriateContent;
      case 'harassment':
        return ReportReason.harassment;
      default:
        return ReportReason.other;
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;
    try {
      await submitReport.mutateAsync({
        targetType: getTargetTypeBackend(),
        targetId,
        reason: getReasonBackend(),
        details,
      });
      setSelectedReason('');
      setDetails('');
      onClose();
    } catch {
      // error handled by mutation
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setDetails('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            Report{' '}
            {targetType === 'post'
              ? 'Post'
              : targetType === 'comment'
              ? 'Comment'
              : 'Profile'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Why are you reporting this {targetType}? Your report will be reviewed by our
            admin team.
          </p>

          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <div
                  key={reason.value}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={reason.value} id={`reason-${reason.value}`} />
                  <Label
                    htmlFor={`reason-${reason.value}`}
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {selectedReason === 'other' && (
            <Textarea
              placeholder="Please provide additional details..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="text-sm resize-none"
              rows={3}
            />
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={submitReport.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!selectedReason || submitReport.isPending}
          >
            {submitReport.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
