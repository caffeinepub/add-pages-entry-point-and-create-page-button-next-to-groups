import React, { useState } from 'react';
import { useGetPosts, useGetGroups } from '../hooks/useQueries';
import PostCard from '../components/PostCard';
import { Loader2, TrendingUp, Users, BarChart2 } from 'lucide-react';
import { Group } from '../backend';
import { useNavigate } from '@tanstack/react-router';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'trending' | 'groups' | 'analytics'>('trending');
  const { data: posts = [], isLoading: postsLoading } = useGetPosts();
  const { data: groups = [], isLoading: groupsLoading } = useGetGroups();

  const trendingPosts = [...posts]
    .sort((a, b) => Number(b.likeCount - a.likeCount))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">Explore</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-background/95 sticky top-[calc(3.5rem+3rem)] z-10">
        {[
          { key: 'trending', label: 'Trending', icon: TrendingUp },
          { key: 'groups', label: 'Groups', icon: Users },
          { key: 'analytics', label: 'Analytics', icon: BarChart2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {activeTab === 'trending' && (
          <>
            {postsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : trendingPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-3" />
                <p>No trending posts yet</p>
              </div>
            ) : (
              trendingPosts.map((post) => (
                <PostCard key={post.id.toString()} post={post} />
              ))
            )}
          </>
        )}

        {activeTab === 'groups' && (
          <>
            {groupsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3" />
                <p>No groups yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group: Group) => (
                  <button
                    key={group.id.toString()}
                    onClick={() => navigate({ to: '/groups/$groupId', params: { groupId: group.id.toString() } })}
                    className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-3 hover:bg-muted/50 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      {group.coverImage ? (
                        <img
                          src={group.coverImage.getDirectURL()}
                          alt={group.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{group.name}</p>
                      {group.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {group.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart2 className="w-12 h-12 mx-auto mb-3" />
            <p className="font-medium">Analytics</p>
            <p className="text-sm mt-1">
              {posts.length} posts · {groups.length} groups
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
