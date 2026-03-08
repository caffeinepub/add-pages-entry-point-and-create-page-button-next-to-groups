import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Home, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import PartnershipBanner from "../components/PartnershipBanner";
import PostCard from "../components/PostCard";
import PromotionalCard from "../components/PromotionalCard";
import QuickPostBar from "../components/QuickPostBar";
import TrendingSection from "../components/TrendingSection";
import WalletView from "../components/WalletView";
import { useView } from "../context/ViewContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetPosts } from "../hooks/useQueries";
import type { Post } from "../types";

export default function HomePage() {
  const { currentView } = useView();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading, refetch } = useGetPosts();

  // Refetch posts whenever a post is created (event dispatched by QuickPostBar)
  useEffect(() => {
    const handlePostCreated = () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      refetch();
    };
    window.addEventListener("postCreated", handlePostCreated);
    return () => window.removeEventListener("postCreated", handlePostCreated);
  }, [queryClient, refetch]);

  if (currentView === "wallet") {
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
          type="button"
          onClick={() => navigate({ to: "/my-constituency" })}
          className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-4 mb-4 hover:bg-muted/50 transition-all text-left shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Home className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">
              My Constituency
            </p>
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
          (posts as Post[])
            .filter(Boolean)
            .map((post) => <PostCard key={post.id.toString()} post={post} />)
        )}
      </div>
    </div>
  );
}
