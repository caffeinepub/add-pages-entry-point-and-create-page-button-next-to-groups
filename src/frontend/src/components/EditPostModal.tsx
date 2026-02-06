import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Video as VideoIcon, X } from 'lucide-react';
import { useUpdatePost } from '../hooks/useQueries';
import type { Post } from '../types';
import { toast } from 'sonner';

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditPostModal({ post, isOpen, onClose }: EditPostModalProps) {
  const [content, setContent] = useState(post.content.text || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const updatePost = useUpdatePost();

  useEffect(() => {
    if (isOpen) {
      setContent(post.content.text || '');
      if (post.content.image) {
        setImagePreview((post.content.image as any).getDirectURL());
      } else {
        setImagePreview(null);
      }
      if (post.content.video) {
        setVideoPreview((post.content.video as any).getDirectURL());
      } else {
        setVideoPreview(null);
      }
      setImageFile(null);
      setVideoFile(null);
      setUploadProgress(0);
    }
  }, [isOpen, post]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video size must be less than 50MB');
      return;
    }

    setVideoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imagePreview && !videoPreview) {
      toast.error('Please add text, an image, or a video to your post');
      return;
    }

    try {
      let imageBlob: any = undefined;
      let videoBlob: any = undefined;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        // Use ExternalBlob from window if available
        if (typeof (window as any).ExternalBlob !== 'undefined') {
          const ExternalBlob = (window as any).ExternalBlob;
          imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage: number) => {
            setUploadProgress(percentage);
          });
        } else {
          imageBlob = uint8Array;
        }
      } else if (imagePreview && post.content.image) {
        imageBlob = post.content.image;
      }

      if (videoFile) {
        const arrayBuffer = await videoFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        // Use ExternalBlob from window if available
        if (typeof (window as any).ExternalBlob !== 'undefined') {
          const ExternalBlob = (window as any).ExternalBlob;
          videoBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage: number) => {
            setUploadProgress(percentage);
          });
        } else {
          videoBlob = uint8Array;
        }
      } else if (videoPreview && post.content.video) {
        videoBlob = post.content.video;
      }

      await updatePost.mutateAsync({
        postId: post.id,
        content: {
          text: content.trim() || undefined,
          image: imageBlob,
          video: videoBlob,
        },
      });

      onClose();
      toast.success('Post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const isUploading = updatePost.isPending && uploadProgress > 0 && uploadProgress < 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={5}
            className="resize-none"
          />

          {/* Inline Media Preview Area */}
          {(imagePreview || videoPreview) && (
            <div className="space-y-2">
              {imagePreview && (
                <div className="relative w-full rounded-lg overflow-hidden border border-border bg-muted">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 shadow-lg"
                    onClick={handleRemoveImage}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {videoPreview && (
                <div className="relative w-full rounded-lg overflow-hidden border border-border bg-black">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-auto max-h-96"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 shadow-lg"
                    onClick={handleRemoveVideo}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {isUploading && (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Uploading: {uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-1">
                <div
                  className="bg-[oklch(0.45_0.12_250)] h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="edit-image-upload"
            />
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => imageInputRef.current?.click()}
              type="button"
              disabled={updatePost.isPending}
            >
              <ImageIcon className="h-4 w-4" />
              {imagePreview ? 'Change Image' : 'Add Image'}
            </Button>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
              id="edit-video-upload"
            />
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => videoInputRef.current?.click()}
              type="button"
              disabled={updatePost.isPending}
            >
              <VideoIcon className="h-4 w-4" />
              {videoPreview ? 'Change Video' : 'Add Video'}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updatePost.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={(!content.trim() && !imagePreview && !videoPreview) || updatePost.isPending}
            className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]"
          >
            {updatePost.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
