import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAnalyticsData } from '../hooks/useQueries';
import { TrendingUp, Users, Heart, MessageCircle, FileText, BarChart3 } from 'lucide-react';
import PostCard from './PostCard';

interface AnalyticsDashboardProps {
  variant?: 'personal' | 'global';
}

export default function AnalyticsDashboard({ variant = 'personal' }: AnalyticsDashboardProps) {
  const { data: analytics, isLoading } = useGetAnalyticsData();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-2 text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>No analytics data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-[oklch(0.45_0.12_250)]" />
        <h3 className="text-xl font-semibold">
          {variant === 'personal' ? 'Your Analytics' : 'Platform Analytics'}
        </h3>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[oklch(0.45_0.12_250)]">
              {Number(analytics.totalPosts).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Total Likes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
              {Number(analytics.totalLikes).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Total Comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {Number(analytics.totalComments).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Followers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {Number(analytics.followerCount).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Poll Votes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {Number(analytics.pollParticipations).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Posts */}
      {analytics.topPosts && analytics.topPosts.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[oklch(0.45_0.12_250)]" />
            {variant === 'personal' ? 'Your Top Posts' : 'Trending Posts'}
          </h4>
          <div className="space-y-4">
            {analytics.topPosts.slice(0, 3).map((post) => (
              <PostCard key={post.id.toString()} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Trending Hashtags */}
      {variant === 'global' && analytics.trendingHashtags && analytics.trendingHashtags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Hashtags
            </CardTitle>
            <CardDescription>Most popular topics in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.trendingHashtags.map((hashtag) => (
                <div
                  key={hashtag.word}
                  className="px-4 py-2 bg-[oklch(0.45_0.12_250)]/10 text-[oklch(0.45_0.12_250)] rounded-full text-sm font-medium"
                >
                  {hashtag.word}
                  <span className="ml-2 text-xs opacity-70">
                    {Number(hashtag.count)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Contributors (Global only) */}
      {variant === 'global' && analytics.topContributors && analytics.topContributors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Contributors
            </CardTitle>
            <CardDescription>Most active users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topContributors.slice(0, 5).map((contributor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-semibold">{contributor.name}</p>
                    <p className="text-sm text-muted-foreground">{contributor.bio}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[oklch(0.45_0.12_250)]">
                      {Number(contributor.followerCount).toLocaleString()} followers
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
