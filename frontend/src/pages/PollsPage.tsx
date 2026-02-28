import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetPolls } from '../hooks/useQueries';
import PollCard from '../components/PollCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, BarChart2 } from 'lucide-react';

export default function PollsPage() {
  const navigate = useNavigate();
  const { data: polls, isLoading, error } = useGetPolls();

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Polls</h1>
        </div>
        <Button
          size="sm"
          onClick={() => navigate({ to: '/create-poll' })}
          className="rounded-full gap-1 h-8 text-xs"
        >
          <Plus className="w-3 h-3" />
          Create Poll
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4">
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
          <p className="text-destructive text-sm">Failed to load polls. Please try again.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && (!polls || polls.length === 0) && (
        <div className="text-center py-12">
          <BarChart2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">No polls yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to create a civic poll!
          </p>
          <Button onClick={() => navigate({ to: '/create-poll' })} className="rounded-full">
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
