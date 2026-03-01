import React from 'react';
import { useGetPosts } from '../hooks/useQueries';
import PostCard from '../components/PostCard';
import QuickPostBar from '../components/QuickPostBar';
import PartnershipBanner from '../components/PartnershipBanner';
import PromotionalCard from '../components/PromotionalCard';
import TrendingSection from '../components/TrendingSection';
import WalletView from '../components/WalletView';
import { useView } from '../context/ViewContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, Home } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { Post } from '../types';

export default function HomePage() {
  const { currentView } = useView();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: posts = [], isLoading } = useGetPosts();

  if (currentView === 'wallet') {
    return <WalletView />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 py-4 max-w-lg mx-auto">
        <PartnershipBanner />
        <PromotionalCard />
        <TrendingSection />

        {/* My Constituency Card */}
        <button
          onClick={() => navigate({ to: '/my-constituency' })}
          className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-4 mb-4 hover:bg-muted/50 transition-all text-left shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Home className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">My Constituency</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              View local representatives and issues
            </p>
          </div>
        </button>

        {identity && <QuickPostBar />}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No posts yet. Be the first to share!
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
