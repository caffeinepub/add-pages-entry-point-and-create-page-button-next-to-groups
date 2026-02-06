import { useState, useRef } from 'react';
import { useCreatePost } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ExternalBlob } from '../backend';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PenLine, Image as ImageIcon, Video as VideoIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatBackendError } from '../utils/backendErrors';

export default function CreatePostCard() {
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
    setUploadProgress(0);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setUploadProgress(0);
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
      
      // Reset form
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
    } catch (error: unknown) {
      console.error('Error creating post:', error);
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    }
  };

  const isUploading = createPost.isPending && uploadProgress > 0 && uploadProgress < 100;
  const trimmedText = content.trim();
  const hasContent = trimmedText || imageFile || videoFile;
  const isSubmitDisabled = !hasContent || createPost.isPending || actorFetching || !actor || !identity;

  return (
    <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
      {!identity && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please log in to create a post
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <PenLine className="h-5 w-5 text-muted-foreground mt-2" />
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share your thoughts on civic matters..."
              rows={3}
              className="resize-none"
              disabled={!identity}
            />

            {/* Inline Media Preview Area */}
            {(imagePreview || videoPreview) && (
              <div className="mt-3 space-y-2">
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
              <div className="mt-3">
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
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <div className="flex gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => imageInputRef.current?.click()}
              type="button"
              disabled={createPost.isPending || !identity}
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
              id="video-upload"
            />
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => videoInputRef.current?.click()}
              type="button"
              disabled={createPost.isPending || !identity}
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
            {createPost.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Posting...
              </>
            ) : actorFetching ? (
              'Initializing...'
            ) : !identity ? (
              'Log in to Post'
            ) : !hasContent ? (
              'Add Content'
            ) : (
              'Create Post'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
