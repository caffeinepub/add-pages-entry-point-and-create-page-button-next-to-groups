import React from 'react';
import { useGetAnalytics, TrendingHashtagItem, AnalyticsResult } from '../hooks/useQueries';
import type { Post, UserProfile } from '../types';
import { Loader2, TrendingUp, Heart, MessageCircle, Users, BarChart2 } from 'lucide-react';

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useGetAnalytics();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Posts" value={analytics.totalPosts} icon={MessageCircle} />
        <StatCard label="Total Likes" value={analytics.totalLikes} icon={Heart} />
        <StatCard label="Poll Votes" value={analytics.pollParticipations} icon={BarChart2} />
        <StatCard label="Followers" value={analytics.followerCount} icon={Users} />
      </div>

      {/* Trending Hashtags */}
      {analytics.trendingHashtags.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Trending Hashtags</h3>
          </div>
          <div className="space-y-2">
            {analytics.trendingHashtags.map((hashtag: TrendingHashtagItem) => (
              <div key={hashtag.word} className="flex items-center justify-between py-1">
                <span className="text-sm text-primary font-medium">{hashtag.word}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {Number(hashtag.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Posts */}
      {analytics.topPosts.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-semibold text-foreground text-sm mb-3">Top Posts</h3>
          <div className="space-y-3">
            {analytics.topPosts.map((post: Post) => (
              <div key={String(post.id)} className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {post.content.text || '(media post)'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {Number(post.likeCount)} likes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Contributors */}
      {analytics.topContributors.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-semibold text-foreground text-sm mb-3">Top Contributors</h3>
          <div className="space-y-3">
            {analytics.topContributors.map((contributor: UserProfile, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                  {contributor.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {contributor.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{contributor.bio}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {Number(contributor.followerCount).toLocaleString()} followers
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
