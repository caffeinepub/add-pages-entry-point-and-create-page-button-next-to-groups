import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Upload, AlertCircle } from 'lucide-react';
import { useGetIssuesByConstituency, useSubmitLocalIssue, useGetPromisesByStatus, useUpdatePromiseStatus } from '../hooks/useQueries';
import { IssueStatus } from '../types';
import { toast } from 'sonner';

export default function MyConstituencyPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const constituency = 'Default Constituency'; // In a real app, this would come from user profile
  const { data: issues = [], isLoading: issuesLoading } = useGetIssuesByConstituency(constituency);
  const { data: promises = [], isLoading: promisesLoading } = useGetPromisesByStatus(IssueStatus.new);
  const submitIssue = useSubmitLocalIssue();
  const updatePromiseStatus = useUpdatePromiseStatus();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageBlob: any = null;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        imageBlob = new Uint8Array(arrayBuffer);
      }

      await submitIssue.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        image: imageBlob,
        location: location.trim() || null,
        constituency,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setImageFile(null);
      setImagePreview(null);
      toast.success('Issue submitted successfully');
    } catch (error) {
      console.error('Error submitting issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.new:
        return <img src="/assets/generated/status-new-badge.dim_64x24.png" alt="New" className="h-6" />;
      case IssueStatus.inReview:
        return <img src="/assets/generated/status-review-badge.dim_64x24.png" alt="In Review" className="h-6" />;
      case IssueStatus.resolved:
        return <img src="/assets/generated/status-resolved-badge.dim_64x24.png" alt="Resolved" className="h-6" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-full bg-background pb-20">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Constituency</h1>
          <p className="text-muted-foreground">Report local issues and track political promises in your area</p>
        </div>

        {/* Issue Submission Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[oklch(0.45_0.12_250)]" />
              Report a Local Issue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the issue"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Specific location or address"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Upload Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Choose Image
                  </Button>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imageFile && <span className="text-sm text-muted-foreground">{imageFile.name}</span>}
                </div>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-4 max-h-48 rounded-lg" />
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Issue'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Reported Issues */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Reported Issues</h2>
          {issuesLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : issues.length > 0 ? (
            <div className="space-y-4">
              {issues.map((issue) => (
                <Card key={issue.id.toString()}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{issue.title}</CardTitle>
                      {getStatusBadge(issue.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                    {issue.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{issue.location}</span>
                      </div>
                    )}
                    {issue.image && (
                      <img
                        src={(issue.image as any).getDirectURL()}
                        alt="Issue"
                        className="rounded-lg max-h-64 w-full object-cover"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      Reported on {formatTimestamp(issue.timestamp)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No issues reported yet in your constituency</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Promise Tracker */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Promise Tracker</h2>
          {promisesLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : promises.length > 0 ? (
            <div className="space-y-4">
              {promises.map((promise) => (
                <Card key={promise.id.toString()}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{promise.title}</CardTitle>
                      {getStatusBadge(promise.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{promise.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No promises being tracked yet</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-muted-foreground border-t">
          <p>
            © 2025. Built with love using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[oklch(0.45_0.12_250)] hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
