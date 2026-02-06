import { useState, useMemo, useEffect } from 'react';
import { useGetAllPosts, useGetNewsFeedPosts, useIsCallerAdmin, useIsUserVerified, useCreateNewsFeedPost } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PostCard from '../components/PostCard';
import QuickPostBar from '../components/QuickPostBar';
import TrendingSection from '../components/TrendingSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { formatBackendError } from '../utils/backendErrors';

type FeedTab = 'public' | 'news';
type NewsSortMode = 'latest' | 'priority';

export default function HomePage() {
  const { data: publicPosts, isLoading: publicLoading } = useGetAllPosts();
  const { data: newsPosts, isLoading: newsLoading } = useGetNewsFeedPosts();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: isVerified } = useIsUserVerified(identity?.getPrincipal() || null);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FeedTab>(() => {
    const saved = localStorage.getItem('civworld-feed-tab');
    return (saved === 'news' ? 'news' : 'public') as FeedTab;
  });
  const [newsSortMode, setNewsSortMode] = useState<NewsSortMode>('latest');
  const [showNewsPostDialog, setShowNewsPostDialog] = useState(false);
  const [newsPostContent, setNewsPostContent] = useState('');
  const createNewsPost = useCreateNewsFeedPost();

  // Persist tab selection
  useEffect(() => {
    localStorage.setItem('civworld-feed-tab', activeTab);
  }, [activeTab]);

  const canCreateNews = isAdmin || isVerified;

  const filteredPublicPosts = useMemo(() => {
    if (!publicPosts) return [];
    if (!selectedHashtag) return publicPosts;

    return publicPosts.filter((post) => {
      const text = post.content.text;
      if (!text) return false;
      
      const words = text.split(/\s+/);
      return words.some((word) => word === selectedHashtag);
    });
  }, [publicPosts, selectedHashtag]);

  const sortedNewsPosts = useMemo(() => {
    if (!newsPosts) return [];
    
    if (newsSortMode === 'latest') {
      return [...newsPosts].sort((a, b) => Number(b.timestamp - a.timestamp));
    } else {
      // Priority sort: could be based on likeCount or other metrics
      return [...newsPosts].sort((a, b) => Number(b.likeCount - a.likeCount));
    }
  }, [newsPosts, newsSortMode]);

  const handleHashtagClick = (hashtag: string) => {
    if (selectedHashtag === hashtag) {
      setSelectedHashtag(null);
    } else {
      setSelectedHashtag(hashtag);
    }
  };

  const clearFilter = () => {
    setSelectedHashtag(null);
  };

  const handleCreateNewsPost = async () => {
    if (createNewsPost.isPending) return;

    const trimmedText = newsPostContent.trim();
    if (!trimmedText) {
      toast.error('Please add text to your news post');
      return;
    }

    try {
      await createNewsPost.mutateAsync({
        content: {
          text: trimmedText,
          image: undefined,
          video: undefined,
        },
      });

      setNewsPostContent('');
      setShowNewsPostDialog(false);
    } catch (error: unknown) {
      console.error('Error creating news post:', error);
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedTab)} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="public" className="data-[state=active]:bg-white data-[state=active]:text-foreground">
              Public Feed
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-white data-[state=active]:text-foreground">
              News Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="mt-6">
            <TrendingSection 
              selectedHashtag={selectedHashtag}
              onHashtagClick={handleHashtagClick}
            />
            
            <QuickPostBar />
            
            {selectedHashtag && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-[oklch(0.45_0.12_250)]/10 border border-[oklch(0.45_0.12_250)]/30 rounded-lg">
                <span className="text-sm text-foreground">
                  Showing posts with <span className="font-semibold text-[oklch(0.45_0.12_250)]">{selectedHashtag}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-7 px-2 text-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.45_0.12_250)]/20"
                  onClick={clearFilter}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}
            
            {publicLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : filteredPublicPosts && filteredPublicPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPublicPosts.map((post) => (
                  <PostCard key={post.id.toString()} post={post} />
                ))}
              </div>
            ) : selectedHashtag ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No posts found with {selectedHashtag}</p>
                <Button
                  variant="link"
                  className="mt-2 text-[oklch(0.45_0.12_250)]"
                  onClick={clearFilter}
                >
                  View all posts
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No posts yet. Be the first to share something!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <Select value={newsSortMode} onValueChange={(value) => setNewsSortMode(value as NewsSortMode)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>

              {canCreateNews && (
                <Button
                  onClick={() => setShowNewsPostDialog(true)}
                  className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create News Post
                </Button>
              )}
            </div>

            {!canCreateNews && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Only verified users and administrators can create News Feed posts. You can still interact with news posts by liking, commenting, and sharing.
                </p>
              </div>
            )}

            {newsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : sortedNewsPosts && sortedNewsPosts.length > 0 ? (
              <div className="space-y-4">
                {sortedNewsPosts.map((post) => (
                  <PostCard key={post.id.toString()} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No news posts yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create News Post Dialog */}
      <Dialog open={showNewsPostDialog} onOpenChange={setShowNewsPostDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create News Post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={newsPostContent}
              onChange={(e) => setNewsPostContent(e.target.value)}
              placeholder="Share important news or announcements..."
              rows={5}
              className="resize-none"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewsPostDialog(false);
                  setNewsPostContent('');
                }}
                disabled={createNewsPost.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNewsPost}
                disabled={!newsPostContent.trim() || createNewsPost.isPending}
                className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]"
              >
                {createNewsPost.isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
