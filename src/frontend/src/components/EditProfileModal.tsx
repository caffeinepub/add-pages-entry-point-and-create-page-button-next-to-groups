import { useState, useEffect } from 'react';
import { useSaveUserProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import HierarchicalLocationSelector from './HierarchicalLocationSelector';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { data: currentProfile } = useGetCallerUserProfile();
  const saveProfile = useSaveUserProfile();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.name);
      setBio(currentProfile.bio);
      setLocation(currentProfile.location);
    }
  }, [currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentProfile) return;

    await saveProfile.mutateAsync({
      name: name.trim(),
      bio: bio.trim(),
      location: location.trim(),
      followerCount: currentProfile.followerCount,
      profilePhoto: currentProfile.profilePhoto,
      badges: currentProfile.badges,
      verifiedStatus: currentProfile.verifiedStatus,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[oklch(0.15_0_0)]">Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name" className="text-sm font-semibold text-[oklch(0.15_0_0)] mb-2 block">
              Name *
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="bg-white border-[oklch(0.70_0.02_250)] text-[oklch(0.15_0_0)] placeholder:text-[oklch(0.50_0.03_250)] focus:border-[oklch(0.45_0.12_250)] focus:ring-2 focus:ring-[oklch(0.45_0.12_250/0.2)]"
            />
          </div>
          <div>
            <Label htmlFor="edit-bio" className="text-sm font-semibold text-[oklch(0.15_0_0)] mb-2 block">
              Bio
            </Label>
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Political enthusiast, writer, and social activist"
              rows={3}
              className="bg-white border-[oklch(0.70_0.02_250)] text-[oklch(0.15_0_0)] placeholder:text-[oklch(0.50_0.03_250)] focus:border-[oklch(0.45_0.12_250)] focus:ring-2 focus:ring-[oklch(0.45_0.12_250/0.2)]"
            />
          </div>
          <div>
            <HierarchicalLocationSelector
              value={location}
              onChange={setLocation}
              initialLocation={currentProfile?.location}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-[oklch(0.70_0.02_250)] text-[oklch(0.15_0_0)] hover:bg-[oklch(0.92_0.01_250)] font-medium"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white font-semibold"
              disabled={!name.trim() || saveProfile.isPending}
            >
              {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
