import { useState } from 'react';
import { useCreateGroup } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateGroupModal({ open, onOpenChange }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createGroup = useCreateGroup();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let coverImageBlob: ExternalBlob | null = null;

      if (coverImage) {
        const arrayBuffer = await coverImage.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        coverImageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      await createGroup.mutateAsync({ name, description, coverImage: coverImageBlob });
      
      setName('');
      setDescription('');
      setCoverImage(null);
      setUploadProgress(0);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a political group or party for like-minded individuals
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Progressive Alliance"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your group's mission and values..."
              rows={4}
              required
            />
          </div>
          <div>
            <Label htmlFor="coverImage">Cover Image (optional)</Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {coverImage && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {coverImage.name}
              </p>
            )}
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading image...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-[oklch(0.45_0.12_250)] h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGroup.isPending || (uploadProgress > 0 && uploadProgress < 100)}
              className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]"
            >
              {createGroup.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
