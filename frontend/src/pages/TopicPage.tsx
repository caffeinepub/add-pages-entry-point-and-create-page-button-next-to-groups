import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetPosts } from '../hooks/useQueries';
import PostCard from '../components/PostCard';
import { ArrowLeft, Hash, Loader2 } from 'lucide-react';

export default function TopicPage() {
  const { topic } = useParams({ from: '/topic/$topic' });
  const navigate = useNavigate();
  const { data: allPosts = [], isLoading } = useGetPosts();

  const topicTag = topic.startsWith('#') ? topic.toLowerCase() : `#${topic.toLowerCase()}`;
  const filteredPosts = allPosts.filter((post) => {
    const text = post.content.text || '';
    return text.toLowerCase().includes(topicTag);
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/' })}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">{topic}</h1>
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          {filteredPosts.length} posts
        </span>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Hash className="w-12 h-12 mx-auto mb-3" />
            <p>No posts found for {topicTag}</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard key={post.id.toString()} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
