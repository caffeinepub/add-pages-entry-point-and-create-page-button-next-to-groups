import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Loader2, CheckCircle2, BarChart3 } from 'lucide-react';
import { useGetPolls, useVotePoll, useHasVotedOnPoll } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Poll } from '../backend';
import { getBackendErrorMessage } from '../utils/backendErrors';
import { toast } from 'sonner';

function PollCard({ poll }: { poll: Poll }) {
  const { identity } = useInternetIdentity();
  const { data: hasVoted = false, isLoading: checkingVote } = useHasVotedOnPoll(poll.id);
  const votePoll = useVotePoll();
  const [votingIndex, setVotingIndex] = useState<number | null>(null);

  const totalVotes = poll.votes.reduce((sum, v) => sum + Number(v), 0);

  const getPercentage = (votes: bigint) => {
    if (totalVotes === 0) return 0;
    return Math.round((Number(votes) / totalVotes) * 100);
  };

  const handleVote = async (optionIndex: number) => {
    if (!identity) {
      toast.error('Please log in to vote');
      return;
    }
    if (hasVoted) {
      toast.info('You have already voted on this poll');
      return;
    }
    setVotingIndex(optionIndex);
    try {
      await votePoll.mutateAsync({ pollId: poll.id, optionIndex: BigInt(optionIndex) });
      toast.success('Vote recorded!');
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    } finally {
      setVotingIndex(null);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 mb-3 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex-1 pr-2 leading-snug">
          {poll.question}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{totalVotes} votes</span>
        </div>
      </div>

      {checkingVote ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {poll.options.map((option, i) => {
            const pct = getPercentage(poll.votes[i]);
            const isVoting = votingIndex === i && votePoll.isPending;

            return (
              <button
                key={i}
                onClick={() => handleVote(i)}
                disabled={hasVoted || votePoll.isPending || !identity}
                className={`w-full text-left rounded-xl overflow-hidden border transition-all ${
                  hasVoted
                    ? 'border-border cursor-default'
                    : 'border-primary/30 hover:border-primary cursor-pointer hover:shadow-sm'
                } disabled:cursor-not-allowed`}
              >
                <div className="relative px-3 py-2.5">
                  {/* Progress bar background */}
                  {hasVoted && (
                    <div
                      className="absolute inset-0 bg-primary/10 rounded-xl transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  )}
                  <div className="relative flex items-center justify-between">
                    <span className="text-sm text-foreground font-medium">{option}</span>
                    <div className="flex items-center gap-1.5">
                      {isVoting && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                      {hasVoted && (
                        <span className="text-xs font-semibold text-primary">{pct}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {hasVoted && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-primary font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          You voted on this poll
        </div>
      )}

      {!identity && (
        <p className="text-xs text-muted-foreground mt-2">Log in to vote</p>
      )}
    </div>
  );
}

export default function PollsPage() {
  const navigate = useNavigate();
  const { data: polls = [], isLoading } = useGetPolls();
  const { identity } = useInternetIdentity();

  const publicPolls = polls.filter((p) => p.isPublic);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Polls</h1>
        {identity && (
          <button
            onClick={() => navigate({ to: '/create-poll' })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        )}
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : publicPolls.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No polls yet</p>
            {identity && (
              <button
                onClick={() => navigate({ to: '/create-poll' })}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
              >
                Create First Poll
              </button>
            )}
          </div>
        ) : (
          publicPolls.map((poll) => <PollCard key={poll.id.toString()} poll={poll} />)
        )}
      </div>
    </div>
  );
}
