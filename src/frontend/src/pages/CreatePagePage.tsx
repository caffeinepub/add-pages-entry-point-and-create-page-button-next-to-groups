import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CreatePagePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [pageName, setPageName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please log in to create a page');
      return;
    }

    if (!pageName.trim()) {
      toast.error('Page name is required');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.info('Page creation is not yet available. Backend functionality coming soon!');
      
      // Navigate back to pages list after showing message
      setTimeout(() => {
        navigate({ to: '/pages' });
      }, 2000);
    } catch (error) {
      toast.error('Failed to create page');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-background pb-20">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/pages' })}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold text-foreground">Create Page</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Set up your page's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pageName">Page Name *</Label>
                <Input
                  id="pageName"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  placeholder="Enter page name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="politics">Politics</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="public-figure">Public Figure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell people about your page"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Add profile and cover images for your page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Profile Image</Label>
                {profileImagePreview ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-border">
                    <img src={profileImagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeProfileImage}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <label htmlFor="profileImage" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Upload Profile Image</span>
                      </div>
                      <input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Cover Image</Label>
                {coverImagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                    <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <label htmlFor="coverImage" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Upload Cover Image</span>
                      </div>
                      <input
                        id="coverImage"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure your page settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={visibility} onValueChange={(value: 'public' | 'private') => setVisibility(value)}>
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="verification">Request Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Request a verified badge for your page
                  </p>
                </div>
                <Switch
                  id="verification"
                  checked={verificationRequested}
                  onCheckedChange={setVerificationRequested}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/pages' })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !pageName.trim() || !category}
              className="flex-1 bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]"
            >
              {isSubmitting ? 'Creating...' : 'Create Page'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
