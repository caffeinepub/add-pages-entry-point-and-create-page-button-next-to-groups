import CreatePostCard from '../components/CreatePostCard';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Calendar } from 'lucide-react';

export default function SharePage() {
  const navigate = useNavigate();

  // Navigate to home after successful post creation
  useEffect(() => {
    const handlePostCreated = () => {
      setTimeout(() => {
        navigate({ to: '/' });
      }, 1000);
    };

    // Listen for successful content creation
    window.addEventListener('postCreated', handlePostCreated);
    
    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
    };
  }, [navigate]);

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Create Content</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Create Post</h3>
            <CreatePostCard />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Create Event</h3>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[oklch(0.45_0.12_250)]" />
                  Event Creation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Event creation functionality will be available soon. Create rallies, town halls, and campaign events!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Video Upload</h3>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="h-5 w-5 text-[oklch(0.45_0.12_250)]" />
                  Video Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Video upload functionality will be available soon. Stay tuned for updates!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
