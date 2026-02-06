import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { useSaveUserProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { validateProfilePhoto, processProfilePhoto } from '../utils/profilePhotoValidation';

interface EditProfilePictureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfilePictureModal({ open, onOpenChange }: EditProfilePictureModalProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const saveProfile = useSaveUserProfile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateProfilePhoto(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsProcessing(true);
    try {
      // Process image (crop and compress)
      const { processedBlob, previewDataUrl } = await processProfilePhoto(file);
      
      setSelectedFile(processedBlob);
      setPreviewUrl(previewDataUrl);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!userProfile) {
      toast.error('Profile not loaded');
      return;
    }

    try {
      let profilePhotoBlob: ExternalBlob | undefined = undefined;

      if (selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        profilePhotoBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      await saveProfile.mutateAsync({
        ...userProfile,
        profilePhoto: profilePhotoBlob || null,
      });

      onOpenChange(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
    } catch (error: any) {
      console.error('Error saving profile photo:', error);
      toast.error(error.message || 'Failed to save profile photo');
    }
  };

  const handleRemove = async () => {
    if (!userProfile) {
      toast.error('Profile not loaded');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        ...userProfile,
        profilePhoto: null,
      });

      onOpenChange(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success('Profile photo removed');
    } catch (error: any) {
      console.error('Error removing profile photo:', error);
      toast.error(error.message || 'Failed to remove profile photo');
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    onOpenChange(false);
  };

  const currentPhotoUrl = userProfile?.profilePhoto?.getDirectURL();
  const displayUrl = previewUrl || currentPhotoUrl;
  const userInitials = userProfile?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const isUploading = saveProfile.isPending && uploadProgress > 0 && uploadProgress < 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-40 w-40 border-4 border-muted">
              {displayUrl ? (
                <AvatarImage src={displayUrl} alt="Profile" />
              ) : (
                <AvatarFallback className="text-4xl font-bold bg-[oklch(0.45_0.12_250)] text-white">
                  {userInitials}
                </AvatarFallback>
              )}
            </Avatar>

            {isProcessing && (
              <div className="text-sm text-muted-foreground">
                Processing image...
              </div>
            )}

            {isUploading && (
              <div className="w-full max-w-xs">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span>Uploading: {uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-[oklch(0.45_0.12_250)] h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              id="profile-photo-upload"
            />
            
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || saveProfile.isPending}
            >
              <Camera className="h-4 w-4" />
              {selectedFile ? 'Choose Different Photo' : 'Upload Photo'}
            </Button>

            {(currentPhotoUrl || selectedFile) && (
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleRemove}
                disabled={isProcessing || saveProfile.isPending}
              >
                <X className="h-4 w-4" />
                Remove Photo
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Accepted formats: JPG, PNG • Max size: 5MB
            <br />
            Images will be cropped to square and compressed
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saveProfile.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedFile || isProcessing || saveProfile.isPending}
            className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]"
          >
            {saveProfile.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
