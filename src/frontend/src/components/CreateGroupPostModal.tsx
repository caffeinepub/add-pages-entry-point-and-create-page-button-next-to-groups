import { useState } from 'react';
import { useCreatePost } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface CreateGroupPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: bigint;
}

export default function CreateGroupPostModal({ open, onOpenChange, groupId }: CreateGroupPostModalProps) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createPost = useCreatePost();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() && !image) {
      toast.error('Please add text or an image');
      return;
    }

    try {
      let imageBlob: ExternalBlob | undefined = undefined;

      if (image) {
        const arrayBuffer = await image.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      await createPost.mutateAsync({
        content: {
          text: text.trim() || undefined,
          image: imageBlob,
        },
        groupId,
      });

      setText('');
      setImage(null);
      setImagePreview(null);
      setUploadProgress(0);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group Post</DialogTitle>
          <DialogDescription>
            Share something with your group members
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="text">Post Content</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="image">Add Image (optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
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
              disabled={createPost.isPending || (uploadProgress > 0 && uploadProgress < 100)}
              className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]"
            >
              {createPost.isPending ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
