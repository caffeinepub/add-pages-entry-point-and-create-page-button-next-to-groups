import { useState } from 'react';
import { useSaveUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import HierarchicalLocationSelector from './HierarchicalLocationSelector';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const saveProfile = useSaveUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await saveProfile.mutateAsync({
      name: name.trim(),
      bio: bio.trim(),
      location: location.trim(),
      profilePhoto: null,
      followerCount: BigInt(0),
      badges: [],
      verifiedStatus: false,
    });
  };

  return (
    <Dialog open={true} modal={true}>
      <DialogContent 
        className="profile-setup-modal sm:max-w-md max-h-[90vh] overflow-y-auto" 
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[oklch(0.15_0_0)]">Welcome to CivWorld</DialogTitle>
          <DialogDescription className="text-base text-[oklch(0.45_0.03_250)]">
            Set up your profile to get started
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="name" className="text-sm font-semibold text-[oklch(0.15_0_0)] mb-2 block">
              Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="mt-1.5 bg-white border-[oklch(0.70_0.02_250)] text-[oklch(0.15_0_0)] placeholder:text-[oklch(0.50_0.03_250)] focus:border-[oklch(0.45_0.12_250)] focus:ring-2 focus:ring-[oklch(0.45_0.12_250/0.2)]"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="bio" className="text-sm font-semibold text-[oklch(0.15_0_0)] mb-2 block">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Political enthusiast, writer, and social activist"
              rows={3}
              className="mt-1.5 bg-white border-[oklch(0.70_0.02_250)] text-[oklch(0.15_0_0)] placeholder:text-[oklch(0.50_0.03_250)] focus:border-[oklch(0.45_0.12_250)] focus:ring-2 focus:ring-[oklch(0.45_0.12_250/0.2)]"
            />
          </div>
          <div>
            <HierarchicalLocationSelector
              value={location}
              onChange={setLocation}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white font-semibold"
            disabled={!name.trim() || saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
