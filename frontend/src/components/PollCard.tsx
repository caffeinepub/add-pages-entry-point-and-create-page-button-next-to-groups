import React, { useState } from 'react';
import { useVoteOnPoll, useGetPollResults, useHasVotedOnPoll } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Poll } from '../types';
import { CheckCircle, BarChart2, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const { identity } = useInternetIdentity();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [justVoted, setJustVoted] = useState(false);

  const voteOnPoll = useVoteOnPoll();
  const { data: pollResults, isLoading: resultsLoading } = useGetPollResults(Number(poll.id));
  const { data: hasVoted, isLoading: hasVotedLoading } = useHasVotedOnPoll(poll.id);

  const isAuthenticated = !!identity;

  // Only consider voted when we have a definitive answer (not loading)
  const alreadyVoted = justVoted || (hasVoted === true && !hasVotedLoading);

  // Show loading skeleton while checking vote status for authenticated users
  const isCheckingVoteStatus = isAuthenticated && hasVotedLoading;

  const totalVotes = pollResults
    ? pollResults.votes.reduce((sum: number, v: any) => sum + Number(v), 0)
    : poll.votes.reduce((sum, v) => sum + Number(v), 0);

  const votes = pollResults ? pollResults.votes : poll.votes;

  const userVoteIndex: number | null = (() => {
    if (justVoted) return selectedOption;
    if (!pollResults) return null;
    const uv = pollResults.userVote;
    if (uv === null || uv === undefined) return null;
    if (Array.isArray(uv)) return uv.length > 0 ? Number(uv[0]) : null;
    return Number(uv);
  })();

  const getPercentage = (voteCount: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  const handleVote = async (optionIndex: number) => {
    if (!isAuthenticated || alreadyVoted || isCheckingVoteStatus) return;
    setSelectedOption(optionIndex);
    try {
      await voteOnPoll.mutateAsync({ pollId: Number(poll.id), optionIndex });
      setJustVoted(true);
    } catch {
      setSelectedOption(null);
    }
  };

  const showResults = alreadyVoted;

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-4 mb-3">
      {/* Poll Header */}
      <div className="flex items-start gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <BarChart2 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm leading-snug">{poll.question}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Options */}
      {isCheckingVoteStatus ? (
        // Loading skeleton while checking vote status
        <div className="space-y-2">
          {poll.options.map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {poll.options.map((option, index) => {
            const voteCount = Number(votes[index] ?? 0);
            const percentage = getPercentage(voteCount);
            const isUserChoice = userVoteIndex === index;
            const isSelected = selectedOption === index;
            const isVoting = voteOnPoll.isPending && isSelected;

            if (showResults) {
              return (
                <div key={index} className="relative">
                  <div
                    className={`relative rounded-xl overflow-hidden border transition-all ${
                      isUserChoice
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    {/* Progress fill */}
                    <div
                      className={`absolute inset-0 transition-all duration-700 ease-out ${
                        isUserChoice ? 'bg-primary/15' : 'bg-muted/50'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex items-center justify-between px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {isUserChoice && (
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            isUserChoice ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {option}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          isUserChoice ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 px-1">
                    <Progress value={percentage} className="h-1" />
                  </div>
                </div>
              );
            }

            return (
              <button
                key={index}
                onClick={() => handleVote(index)}
                disabled={
                  !isAuthenticated ||
                  voteOnPoll.isPending ||
                  alreadyVoted ||
                  isCheckingVoteStatus
                }
                className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted/30 text-foreground hover:border-primary/50 hover:bg-primary/5'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {isVoting && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
        </span>
        {!isAuthenticated && (
          <span className="text-xs text-muted-foreground">Login to vote</span>
        )}
        {isCheckingVoteStatus && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading...
          </span>
        )}
        {alreadyVoted && !isCheckingVoteStatus && (
          <span className="text-xs text-primary font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Voted
          </span>
        )}
      </div>
    </div>
  );
}
