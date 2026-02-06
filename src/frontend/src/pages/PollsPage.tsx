import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Share2, MessageSquare, TrendingUp, Clock, MapPin, Map, Globe, Plus } from 'lucide-react';
import { useGetAllPolls, useVoteOnPoll } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';

type FilterType = 'trending' | 'latest' | 'local' | 'state' | 'national';

export default function PollsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('trending');
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  const { data: polls = [], isLoading } = useGetAllPolls();
  const voteOnPoll = useVoteOnPoll();
  const { identity } = useInternetIdentity();

  const handleVote = async (pollId: bigint, optionIndex: number) => {
    if (!identity) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      await voteOnPoll.mutateAsync({
        pollId,
        selectedOption: BigInt(optionIndex),
      });
      setVotedPolls(prev => new Set(prev).add(pollId.toString()));
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const hasVoted = (pollId: bigint) => votedPolls.has(pollId.toString());

  const calculatePercentage = (votes: bigint, totalVotes: bigint) => {
    if (totalVotes === 0n) return 0;
    return Number((votes * 100n) / totalVotes);
  };

  const getTotalVotes = (poll: any) => {
    return poll.votes.reduce((sum: bigint, count: bigint) => sum + count, 0n);
  };

  // Mock category and region data (will come from backend in future)
  const getPollCategory = (index: number) => {
    const categories = ['policy', 'governance', 'economy', 'socialIssues'];
    return categories[index % categories.length];
  };

  const getPollRegion = (index: number) => {
    const regions = ['local', 'state', 'national'];
    return regions[index % regions.length];
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      policy: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      governance: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      economy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      socialIssues: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[category] || colors.policy;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      policy: 'Policy',
      governance: 'Governance',
      economy: 'Economy',
      socialIssues: 'Social Issues',
    };
    return labels[category] || 'Policy';
  };

  const getRegionLabel = (region: string) => {
    const labels: Record<string, string> = {
      local: 'Local',
      state: 'State',
      national: 'National',
    };
    return labels[region] || 'Local';
  };

  const getRegionIcon = (region: string) => {
    if (region === 'local') return MapPin;
    if (region === 'state') return Map;
    return Globe;
  };

  // Filter polls based on active filter (mock implementation)
  const filteredPolls = polls.filter((_, index) => {
    if (activeFilter === 'trending') return true; // Show all for trending
    if (activeFilter === 'latest') return true; // Show all for latest
    const region = getPollRegion(index);
    return region === activeFilter;
  });

  const filterTabs: { key: FilterType; label: string; icon: any }[] = [
    { key: 'trending', label: 'Trending', icon: TrendingUp },
    { key: 'latest', label: 'Latest', icon: Clock },
    { key: 'local', label: 'Local', icon: MapPin },
    { key: 'state', label: 'State', icon: Map },
    { key: 'national', label: 'National', icon: Globe },
  ];

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-[oklch(0.45_0.12_250)]" />
            <h2 className="text-2xl font-bold text-foreground">Polls</h2>
          </div>
          
          {/* New Poll Button */}
          <Button
            onClick={() => navigate({ to: '/polls/create' })}
            className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Poll
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {filterTabs.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant="ghost"
                onClick={() => setActiveFilter(key)}
                className={`flex items-center gap-2 rounded-b-none border-b-2 transition-colors ${
                  activeFilter === key
                    ? 'border-[oklch(0.45_0.12_250)] text-[oklch(0.45_0.12_250)] bg-[oklch(0.45_0.12_250)]/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Polls List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[oklch(0.45_0.12_250)] mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading polls...</p>
          </div>
        ) : filteredPolls.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Polls Available</h3>
                <p className="text-muted-foreground mb-4">
                  {activeFilter === 'trending'
                    ? 'No polls are trending right now. Check back soon!'
                    : `No ${activeFilter} polls available at the moment.`}
                </p>
                <Button
                  onClick={() => navigate({ to: '/polls/create' })}
                  className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Poll
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredPolls.map((poll, index) => {
              const totalVotes = getTotalVotes(poll);
              const userHasVoted = hasVoted(poll.id);
              const category = getPollCategory(index);
              const region = getPollRegion(index);
              const RegionIcon = getRegionIcon(region);

              return (
                <Card key={poll.id.toString()} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <CardTitle className="text-xl font-semibold leading-tight flex-1">
                        {poll.question}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getCategoryColor(category)}>
                        {getCategoryLabel(category)}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <RegionIcon className="h-3 w-3" />
                        {getRegionLabel(region)}
                      </Badge>
                      {!poll.isPublic && (
                        <Badge variant="secondary" className="text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Voting Options */}
                    <div className="space-y-3">
                      {poll.options.map((option: string, optionIndex: number) => {
                        const votes = poll.votes[optionIndex];
                        const percentage = calculatePercentage(votes, totalVotes);

                        return (
                          <div key={optionIndex} className="space-y-2">
                            {!userHasVoted ? (
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-[oklch(0.45_0.12_250)]/5 hover:border-[oklch(0.45_0.12_250)] transition-colors"
                                onClick={() => handleVote(poll.id, optionIndex)}
                                disabled={voteOnPoll.isPending}
                              >
                                <span className="font-medium">{option}</span>
                              </Button>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">{option}</span>
                                  <span className="text-muted-foreground">
                                    {percentage.toFixed(1)}% ({votes.toString()} votes)
                                  </span>
                                </div>
                                <Progress value={percentage} className="h-2" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Votes */}
                    {userHasVoted && (
                      <div className="text-sm text-muted-foreground pt-2 border-t">
                        Total votes: {totalVotes.toString()}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      {!userHasVoted && (
                        <Button
                          size="sm"
                          className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white"
                          disabled={voteOnPoll.isPending}
                        >
                          {voteOnPoll.isPending ? 'Voting...' : 'Vote'}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => toast.info('Discussion feature coming soon')}
                      >
                        <MessageSquare className="h-4 w-4" />
                        View Discussion
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => toast.success('Poll link copied to clipboard')}
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 mt-12 text-sm text-muted-foreground border-t">
          <p>
            © 2025. Built with love using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[oklch(0.45_0.12_250)] hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
