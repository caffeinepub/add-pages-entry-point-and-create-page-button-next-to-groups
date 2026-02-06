import { useGetAllPosts } from '../hooks/useQueries';
import CreatePostCard from '../components/CreatePostCard';
import PostCard from '../components/PostCard';

export default function DiscussionsPage() {
  const { data: posts = [], isLoading } = useGetAllPosts();

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Discussions</h1>
          <p className="text-muted-foreground">Share your thoughts and engage in civic conversations</p>
        </div>

        {/* Integrated Post Creation */}
        <div className="mb-6">
          <CreatePostCard />
        </div>

        {/* Discussion Feed */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id.toString()} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <img 
              src="/assets/generated/debate-discussion-icon.dim_32x32.png" 
              alt="No discussions" 
              className="h-16 w-16 mx-auto mb-4 opacity-50"
            />
            <p className="text-muted-foreground text-lg mb-2">No discussions yet</p>
            <p className="text-sm text-muted-foreground">Be the first to start a conversation</p>
          </div>
        )}
      </div>

      <footer className="mt-16 py-8 border-t border-border bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025. Built with ❤️ using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="text-[oklch(0.45_0.12_250)] hover:underline">caffeine.ai</a></p>
        </div>
      </footer>
    </div>
  );
}

