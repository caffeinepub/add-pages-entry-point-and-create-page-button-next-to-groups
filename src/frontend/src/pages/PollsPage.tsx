import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { BarChart2, Plus, TrendingUp } from "lucide-react";
import React from "react";
import PollCard from "../components/PollCard";
import { useGetPolls } from "../hooks/useQueries";

export default function PollsPage() {
  const navigate = useNavigate();
  const { data: polls, isLoading, error } = useGetPolls();

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Polls</h1>
        </div>
        <Button
          size="sm"
          onClick={() => navigate({ to: "/create-poll" })}
          className="rounded-full gap-1 h-8 text-xs"
        >
          <Plus className="w-3 h-3" />
          Create Poll
        </Button>
      </div>

      {/* Sample Results Banner */}
      <button
        type="button"
        onClick={() => navigate({ to: "/poll-results" })}
        className="w-full mb-4 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl px-4 py-3 shadow-soft hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-150"
      >
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold">View Detailed Poll Results</p>
          <p className="text-xs text-blue-100 mt-0.5">
            Region-wise breakdown · Animated results · Live analytics
          </p>
        </div>
        <span className="text-blue-200 text-lg">›</span>
      </button>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-border p-4"
            >
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-8">
          <p className="text-destructive text-sm">
            Failed to load polls. Please try again.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && (!polls || polls.length === 0) && (
        <div className="text-center py-12">
          <BarChart2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">
            No polls yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to create a civic poll!
          </p>
          <Button
            onClick={() => navigate({ to: "/create-poll" })}
            className="rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Poll
          </Button>
        </div>
      )}

      {/* Polls list */}
      {!isLoading && polls && polls.length > 0 && (
        <div className="space-y-3">
          {polls.map((poll) => (
            <PollCard key={Number(poll.id)} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
