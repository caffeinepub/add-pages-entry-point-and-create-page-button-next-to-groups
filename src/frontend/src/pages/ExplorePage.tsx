import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllPosts, useGetAllGroups } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, BarChart3 } from 'lucide-react';
import PostCard from '../components/PostCard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

type FilterType = 'posts' | 'groups' | 'analytics';

export default function ExplorePage() {
  const navigate = useNavigate();
  const { data: allPosts, isLoading: postsLoading } = useGetAllPosts();
  const { data: allGroups, isLoading: groupsLoading } = useGetAllGroups();
  const [filter, setFilter] = useState<FilterType>('posts');

  // Calculate trending posts (most liked/commented in last 24 hours)
  const trendingPosts = useMemo(() => {
    if (!allPosts) return [];
    const now = Date.now() * 1000000; // Convert to nanoseconds
    const dayAgo = now - (24 * 60 * 60 * 1000 * 1000000);
    
    return allPosts
      .filter(post => Number(post.timestamp) > dayAgo)
      .sort((a, b) => Number(b.likeCount) - Number(a.likeCount))
      .slice(0, 10);
  }, [allPosts]);

  // Calculate active groups (most posts in last 24 hours)
  const activeGroups = useMemo(() => {
    if (!allGroups || !allPosts) return [];
    
    const now = Date.now() * 1000000;
    const dayAgo = now - (24 * 60 * 60 * 1000 * 1000000);
    
    const groupPostCounts = new Map<string, number>();
    
    allPosts.forEach(post => {
      if (post.groupId && Number(post.timestamp) > dayAgo) {
        const groupIdStr = post.groupId.toString();
        groupPostCounts.set(groupIdStr, (groupPostCounts.get(groupIdStr) || 0) + 1);
      }
    });
    
    return allGroups
      .map(group => ({
        group,
        postCount: groupPostCounts.get(group.id.toString()) || 0,
      }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 10);
  }, [allGroups, allPosts]);

  return (
    <div className="min-h-full bg-background pb-20">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-8 w-8 text-[oklch(0.45_0.12_250)]" />
          <h2 className="text-2xl font-bold text-foreground">Explore</h2>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="posts">Trending Posts</TabsTrigger>
            <TabsTrigger value="groups">Active Groups</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {postsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : trendingPosts.length > 0 ? (
              <>
                <div className="bg-[oklch(0.45_0.12_250)]/10 border border-[oklch(0.45_0.12_250)]/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-foreground">
                    <TrendingUp className="inline h-4 w-4 mr-1" />
                    Showing the most popular posts from the last 24 hours
                  </p>
                </div>
                {trendingPosts.map((post) => (
                  <PostCard key={post.id.toString()} post={post} />
                ))}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No trending posts yet. Check back later!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            {groupsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : activeGroups.length > 0 ? (
              <>
                <div className="bg-[oklch(0.45_0.12_250)]/10 border border-[oklch(0.45_0.12_250)]/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-foreground">
                    <Users className="inline h-4 w-4 mr-1" />
                    Showing the most active groups from the last 24 hours
                  </p>
                </div>
                {activeGroups.map(({ group, postCount }) => (
                  <Card 
                    key={group.id.toString()} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate({ to: `/groups/${group.id.toString()}` })}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-[oklch(0.45_0.12_250)]" />
                          {group.name}
                        </span>
                        {postCount > 0 && (
                          <span className="text-sm font-normal text-muted-foreground">
                            {postCount} post{postCount !== 1 ? 's' : ''} today
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No active groups yet. Create or join one!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard variant="global" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
