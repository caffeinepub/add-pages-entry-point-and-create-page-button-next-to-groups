import React from 'react';
import { useGetPosts } from '../hooks/useQueries';
import PostCard from '../components/PostCard';
import CreatePostCard from '../components/CreatePostCard';
import { Loader2, MessageSquare } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Post } from '../types';

export default function DiscussionsPage() {
  const { data: posts = [], isLoading, refetch } = useGetPosts();
  const { identity } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">Discussions</h1>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {identity && (
          <CreatePostCard onPostCreated={() => refetch()} />
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No discussions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to start a discussion!
            </p>
          </div>
        ) : (
          (posts as Post[]).filter(Boolean).map((post) => (
            <PostCard key={post.id.toString()} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
