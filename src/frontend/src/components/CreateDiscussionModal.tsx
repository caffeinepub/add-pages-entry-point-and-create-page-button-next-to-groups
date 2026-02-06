import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateDiscussion } from '../hooks/useQueries';
import { DiscussionCategory } from '../types';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: DiscussionCategory;
}

export default function CreateDiscussionModal({ isOpen, onClose, defaultCategory }: CreateDiscussionModalProps) {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState<DiscussionCategory>(defaultCategory || DiscussionCategory.policy);

  const createMutation = useCreateDiscussion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !context.trim() || !region.trim()) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        context: context.trim(),
        region: region.trim(),
        category,
      });

      // Reset form
      setTitle('');
      setContext('');
      setRegion('');
      setCategory(defaultCategory || DiscussionCategory.policy);
      onClose();
    } catch (error) {
      console.error('Failed to create discussion:', error);
    }
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      setTitle('');
      setContext('');
      setRegion('');
      setCategory(defaultCategory || DiscussionCategory.policy);
      onClose();
    }
  };

  const categories = [
    { value: DiscussionCategory.policy, label: 'Policy' },
    { value: DiscussionCategory.governance, label: 'Governance' },
    { value: DiscussionCategory.economy, label: 'Economy' },
    { value: DiscussionCategory.socialIssues, label: 'Social Issues' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Start a Discussion</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Share your perspective on an important civic issue
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as DiscussionCategory)}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="What is the main issue or question?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">{title.length}/150 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context" className="text-sm font-medium">
              Context <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="context"
              placeholder="Provide background information or reasoning..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={5}
              maxLength={500}
              required
              className="w-full resize-none"
            />
            <p className="text-xs text-muted-foreground">{context.length}/500 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region" className="text-sm font-medium">
              Region <span className="text-destructive">*</span>
            </Label>
            <Input
              id="region"
              placeholder="e.g., National, California, New York City"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              maxLength={50}
              required
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Specify the location or region this discussion relates to</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !title.trim() || !context.trim() || !region.trim()}
              className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white"
            >
              {createMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                'Create Discussion'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
