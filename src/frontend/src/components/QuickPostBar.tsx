import { useState, useRef } from 'react';
import { Image as ImageIcon, Video as VideoIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePost } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { formatBackendError } from '../utils/backendErrors';

export default function QuickPostBar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Guard against concurrent submissions
    if (createPost.isPending) {
      return;
    }

    // Check authentication
    if (!identity) {
      toast.error('Please log in to create a post');
      return;
    }

    // Check actor availability
    if (!actor || actorFetching) {
      toast.error('System is initializing. Please wait a moment and try again');
      return;
    }

    // Validate content
    const trimmedText = content.trim();
    if (!trimmedText && !imageFile && !videoFile) {
      toast.error('Please add text, an image, or a video to your post');
      return;
    }

    // Check for whitespace-only text
    if (trimmedText.length === 0 && content.length > 0) {
      toast.error('Post cannot contain only whitespace');
      return;
    }

    try {
      let imageBlob: ExternalBlob | undefined = undefined;
      let videoBlob: ExternalBlob | undefined = undefined;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      if (videoFile) {
        const arrayBuffer = await videoFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        videoBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      await createPost.mutateAsync({
        content: {
          text: trimmedText || undefined,
          image: imageBlob,
          video: videoBlob,
        },
        groupId: null,
      });

      // Reset form and close dialog
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      setVideoFile(null);
      setVideoPreview(null);
      setUploadProgress(0);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      setIsDialogOpen(false);
    } catch (error: unknown) {
      console.error('Error creating post:', error);
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    }
  };

  const openDialog = () => {
    if (!identity) {
      toast.error('Please log in to create a post');
      return;
    }
    setIsDialogOpen(true);
  };

  const openDialogWithImage = () => {
    if (!identity) {
      toast.error('Please log in to create a post');
      return;
    }
    setIsDialogOpen(true);
    setTimeout(() => {
      imageInputRef.current?.click();
    }, 100);
  };

  const openDialogWithVideo = () => {
    if (!identity) {
      toast.error('Please log in to create a post');
      return;
    }
    setIsDialogOpen(true);
    setTimeout(() => {
      videoInputRef.current?.click();
    }, 100);
  };

  const isUploading = createPost.isPending && uploadProgress > 0 && uploadProgress < 100;
  const trimmedText = content.trim();
  const hasContent = trimmedText || imageFile || videoFile;
  const isSubmitDisabled = !hasContent || createPost.isPending || actorFetching || !actor || !identity;

  return (
    <>
      <div className="bg-white border border-border rounded-lg p-3 shadow-sm mb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={openDialog}
            type="button"
            className="flex-1 text-left px-4 py-2 bg-muted rounded-full text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            What's on your mind?
          </button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.45_0.12_250)]/10"
            onClick={openDialogWithImage}
            title="Add Image"
            type="button"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.45_0.12_250)]/10"
            onClick={openDialogWithVideo}
            title="Add Video"
            type="button"
          >
            <VideoIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share your thoughts on civic matters..."
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

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <div className="flex gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="quick-post-image-upload"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => imageInputRef.current?.click()}
                  type="button"
                  disabled={createPost.isPending}
                >
                  <ImageIcon className="h-4 w-4" />
                  {imageFile ? 'Change Image' : 'Add Image'}
                </Button>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                  id="quick-post-video-upload"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => videoInputRef.current?.click()}
                  type="button"
                  disabled={createPost.isPending}
                >
                  <VideoIcon className="h-4 w-4" />
                  {videoFile ? 'Change Video' : 'Add Video'}
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPost.isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
