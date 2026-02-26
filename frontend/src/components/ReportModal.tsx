import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSubmitReport } from '../hooks/useQueries';
import { ReportReason, ReportTargetType } from '../types';
import { AlertCircle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'post' | 'comment' | 'profile';
  targetId: bigint;
}

export default function ReportModal({ isOpen, onClose, targetType, targetId }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string>('');
  const submitReport = useSubmitReport();

  const reasons = [
    { value: 'spam', label: 'Spam', description: 'Repetitive or unsolicited content' },
    { value: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
    { value: 'inappropriateContent', label: 'Inappropriate Content', description: 'Offensive or unsuitable material' },
    { value: 'harassment', label: 'Harassment', description: 'Bullying or threatening behavior' },
    { value: 'other', label: 'Other', description: 'Other concerns not listed above' },
  ];

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Please select a reason for reporting');
      return;
    }

    setError('');

    // Map string to ReportReason enum
    let reasonEnum: ReportReason;
    switch (selectedReason) {
      case 'spam':
        reasonEnum = ReportReason.spam;
        break;
      case 'misinformation':
        reasonEnum = ReportReason.misinformation;
        break;
      case 'inappropriateContent':
        reasonEnum = ReportReason.inappropriateContent;
        break;
      case 'harassment':
        reasonEnum = ReportReason.harassment;
        break;
      case 'other':
        reasonEnum = ReportReason.other;
        break;
      default:
        reasonEnum = ReportReason.other;
    }

    // Map string to ReportTargetType enum
    let targetTypeEnum: ReportTargetType;
    switch (targetType) {
      case 'post':
        targetTypeEnum = ReportTargetType.post;
        break;
      case 'comment':
        targetTypeEnum = ReportTargetType.comment;
        break;
      case 'profile':
        targetTypeEnum = ReportTargetType.profile;
        break;
      default:
        targetTypeEnum = ReportTargetType.post;
    }

    try {
      await submitReport.mutateAsync({
        targetType: targetTypeEnum,
        targetId,
        reason: reasonEnum,
        details: details.trim(),
      });
      
      // Reset form and close
      setSelectedReason('');
      setDetails('');
      setError('');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report. Please try again.');
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setDetails('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white z-[10000] border-[oklch(0.70_0.02_250)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-[oklch(0.45_0.12_250)]" />
            Report Content
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            Help us maintain a respectful civic discussion platform. Your report will be reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">
              Reason for Report <span className="text-destructive">*</span>
            </Label>
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {reasons.map((reason) => (
                <div 
                  key={reason.value} 
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-[oklch(0.70_0.02_250)]"
                >
                  <RadioGroupItem 
                    value={reason.value} 
                    id={reason.value} 
                    className="mt-1 border-[oklch(0.60_0.02_250)] data-[state=checked]:border-[oklch(0.45_0.12_250)] data-[state=checked]:bg-[oklch(0.45_0.12_250)]" 
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={reason.value}
                      className="text-sm font-semibold text-foreground cursor-pointer"
                    >
                      {reason.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">{reason.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details" className="text-base font-semibold text-foreground">
              Additional Details (Optional)
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context that might help us understand your concern..."
              rows={4}
              className="resize-none border-[oklch(0.70_0.02_250)] focus:border-[oklch(0.45_0.12_250)] focus:ring-[oklch(0.45_0.12_250)]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {details.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitReport.isPending}
            className="border-[oklch(0.70_0.02_250)] hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || submitReport.isPending}
            className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitReport.isPending ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
