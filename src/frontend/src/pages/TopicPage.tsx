import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllPosts } from '../hooks/useQueries';
import PostCard from '../components/PostCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hash, MessageSquarePlus } from 'lucide-react';
import { useMemo } from 'react';

export default function TopicPage() {
  const { hashtag } = useParams({ from: '/topic/$hashtag' });
  const navigate = useNavigate();
  const { data: posts, isLoading } = useGetAllPosts();

  const decodedHashtag = decodeURIComponent(hashtag);

  const topicPosts = useMemo(() => {
    if (!posts) return [];
    
    return posts.filter((post) => {
      const text = post.content.text;
      if (!text) return false;
      
      const words = text.split(/\s+/);
      return words.some((word) => word === decodedHashtag);
    });
  }, [posts, decodedHashtag]);

  const handleStartDiscussion = () => {
    navigate({ to: '/discussions' });
  };

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 text-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.45_0.12_250)]/10"
            onClick={() => navigate({ to: '/' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>

          <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[oklch(0.45_0.12_250)]/10 flex items-center justify-center">
                  <Hash className="h-6 w-6 text-[oklch(0.45_0.12_250)]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{decodedHashtag}</h1>
                  <p className="text-sm text-muted-foreground">
                    {topicPosts.length} {topicPosts.length === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleStartDiscussion}
                className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] gap-2"
              >
                <MessageSquarePlus className="h-4 w-4" />
                Start Discussion
              </Button>
            </div>
          </div>
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : topicPosts.length > 0 ? (
          <div className="space-y-4">
            {topicPosts.map((post) => (
              <PostCard key={post.id.toString()} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-border">
            <Hash className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to start a discussion about {decodedHashtag}
            </p>
            <Button
              onClick={handleStartDiscussion}
              className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]"
            >
              Start Discussion
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
