import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ChevronDown,
  ChevronUp,
  Share2,
  Users,
  Flag,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface RegionBreakdown {
  id: string;
  name: string;
  votes: number;
  districts: {
    id: string;
    name: string;
    votes: number;
    mandals: {
      id: string;
      name: string;
      votes: number;
    }[];
  }[];
}

interface MockComment {
  id: number;
  username: string;
  avatar: string;
  text: string;
  time: string;
}

const MOCK_POLL = {
  id: 1,
  question: 'Which civic infrastructure improvement should be prioritized in our area?',
  creator: {
    name: 'Civic Observer',
    district: 'District 3',
    avatar: '/assets/generated/default-profile.dim_200x200.png',
  },
  status: 'Active' as 'Active' | 'Closed',
  totalVotes: 4820,
  timeRemaining: '2 days left',
  isPublic: true,
  options: [
    { id: 1, text: 'Road & Pothole Repair', votes: 2169 },
    { id: 2, text: 'Clean Water Supply', votes: 1446 },
    { id: 3, text: 'Public Parks & Green Spaces', votes: 723 },
    { id: 4, text: 'Street Lighting Upgrade', votes: 482 },
  ] as PollOption[],
};

const MOCK_REGIONS: RegionBreakdown[] = [
  {
    id: 'r1',
    name: 'Region A',
    votes: 1850,
    districts: [
      {
        id: 'd1',
        name: 'District 1',
        votes: 1100,
        mandals: [
          { id: 'm1', name: 'Mandal X', votes: 620 },
          { id: 'm2', name: 'Mandal Y', votes: 480 },
        ],
      },
      {
        id: 'd2',
        name: 'District 2',
        votes: 750,
        mandals: [
          { id: 'm3', name: 'Mandal P', votes: 430 },
          { id: 'm4', name: 'Mandal Q', votes: 320 },
        ],
      },
    ],
  },
  {
    id: 'r2',
    name: 'Region B',
    votes: 1620,
    districts: [
      {
        id: 'd3',
        name: 'District 3',
        votes: 980,
        mandals: [
          { id: 'm5', name: 'Mandal Alpha', votes: 560 },
          { id: 'm6', name: 'Mandal Beta', votes: 420 },
        ],
      },
      {
        id: 'd4',
        name: 'District 4',
        votes: 640,
        mandals: [
          { id: 'm7', name: 'Mandal Gamma', votes: 370 },
          { id: 'm8', name: 'Mandal Delta', votes: 270 },
        ],
      },
    ],
  },
  {
    id: 'r3',
    name: 'Region C',
    votes: 1350,
    districts: [
      {
        id: 'd5',
        name: 'District 5',
        votes: 800,
        mandals: [
          { id: 'm9', name: 'Mandal One', votes: 450 },
          { id: 'm10', name: 'Mandal Two', votes: 350 },
        ],
      },
      {
        id: 'd6',
        name: 'District 6',
        votes: 550,
        mandals: [
          { id: 'm11', name: 'Mandal Three', votes: 310 },
          { id: 'm12', name: 'Mandal Four', votes: 240 },
        ],
      },
    ],
  },
];

const MOCK_COMMENTS: MockComment[] = [
  {
    id: 1,
    username: 'Priya S.',
    avatar: '/assets/generated/default-profile.dim_200x200.png',
    text: 'Road repair is long overdue in our area. Voted for it!',
    time: '1h ago',
  },
  {
    id: 2,
    username: 'Rajan M.',
    avatar: '/assets/generated/default-profile.dim_200x200.png',
    text: 'Clean water should be the top priority — basic necessity first.',
    time: '3h ago',
  },
  {
    id: 3,
    username: 'Anita K.',
    avatar: '/assets/generated/default-profile.dim_200x200.png',
    text: 'Green spaces improve mental health and community bonding. My vote!',
    time: '5h ago',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ percentage, isWinner, animated }: { percentage: number; isWinner: boolean; animated: boolean }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
          isWinner ? 'bg-emerald-500' : 'bg-blue-500'
        }`}
        style={{ width: animated ? `${percentage}%` : '0%' }}
      />
    </div>
  );
}

function VotingButtons({
  options,
  onVote,
}: {
  options: PollOption[];
  onVote: (optionId: number) => void;
}) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onVote(option.id)}
          className="w-full text-left px-4 py-3.5 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 active:scale-[0.98] transition-all duration-150 font-medium text-slate-700 text-sm"
        >
          {option.text}
        </button>
      ))}
    </div>
  );
}

function ResultBars({
  options,
  totalVotes,
  selectedOptionId,
  animated,
}: {
  options: PollOption[];
  totalVotes: number;
  selectedOptionId: number | null;
  animated: boolean;
}) {
  const maxVotes = Math.max(...options.map((o) => o.votes));

  return (
    <div className="space-y-4">
      {options.map((option) => {
        const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
        const isWinner = option.votes === maxVotes;
        const isSelected = option.id === selectedOptionId;

        return (
          <div
            key={option.id}
            className={`rounded-2xl p-4 border-2 transition-all duration-300 ${
              isWinner
                ? 'border-emerald-400 bg-emerald-50'
                : isSelected
                ? 'border-blue-300 bg-blue-50'
                : 'border-slate-100 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isWinner && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
                {isSelected && !isWinner && (
                  <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex-shrink-0" />
                )}
                {!isWinner && !isSelected && (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                )}
                <span className="text-sm font-semibold text-slate-700 truncate">{option.text}</span>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <span className="text-xs text-slate-500">{option.votes.toLocaleString()}</span>
                <span
                  className={`text-sm font-bold ${
                    isWinner ? 'text-emerald-600' : 'text-blue-600'
                  }`}
                >
                  {pct}%
                </span>
              </div>
            </div>
            <ProgressBar percentage={pct} isWinner={isWinner} animated={animated} />
          </div>
        );
      })}
    </div>
  );
}

function RegionRow({
  name,
  votes,
  totalVotes,
  level,
}: {
  name: string;
  votes: number;
  totalVotes: number;
  level: 'region' | 'district' | 'mandal';
}) {
  const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  const indent = level === 'district' ? 'pl-4' : level === 'mandal' ? 'pl-8' : '';
  const dotColor =
    level === 'region'
      ? 'bg-blue-500'
      : level === 'district'
      ? 'bg-blue-300'
      : 'bg-slate-300';

  return (
    <div className={`flex items-center justify-between py-2 ${indent}`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
        <span
          className={`truncate ${
            level === 'region'
              ? 'text-sm font-semibold text-slate-700'
              : level === 'district'
              ? 'text-sm font-medium text-slate-600'
              : 'text-xs text-slate-500'
          }`}
        >
          {name}
        </span>
      </div>
      <div className="flex items-center gap-3 ml-2 flex-shrink-0">
        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full bg-blue-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 w-8 text-right">{votes.toLocaleString()}</span>
        <span className="text-xs font-semibold text-blue-600 w-8 text-right">{pct}%</span>
      </div>
    </div>
  );
}

function RegionAccordion({ regions, totalVotes }: { regions: RegionBreakdown[]; totalVotes: number }) {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set());

  const toggleRegion = (id: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDistrict = (id: string) => {
    setExpandedDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-1">
      {regions.map((region) => {
        const regionExpanded = expandedRegions.has(region.id);
        const regionPct = totalVotes > 0 ? Math.round((region.votes / totalVotes) * 100) : 0;

        return (
          <div key={region.id} className="rounded-xl border border-slate-100 overflow-hidden">
            {/* Region row */}
            <button
              onClick={() => toggleRegion(region.id)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-700 truncate">{region.name}</span>
              </div>
              <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-blue-500 transition-all duration-700"
                    style={{ width: `${regionPct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-10 text-right">{region.votes.toLocaleString()}</span>
                <span className="text-xs font-bold text-blue-600 w-8 text-right">{regionPct}%</span>
                {regionExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </div>
            </button>

            {/* Districts */}
            {regionExpanded && (
              <div className="border-t border-slate-100 bg-slate-50">
                {region.districts.map((district) => {
                  const districtExpanded = expandedDistricts.has(district.id);
                  const districtPct =
                    totalVotes > 0 ? Math.round((district.votes / totalVotes) * 100) : 0;

                  return (
                    <div key={district.id}>
                      <button
                        onClick={() => toggleDistrict(district.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 pl-8 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-blue-300 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-600 truncate">
                            {district.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                          <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-blue-300 transition-all duration-700"
                              style={{ width: `${districtPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-10 text-right">
                            {district.votes.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-blue-500 w-8 text-right">
                            {districtPct}%
                          </span>
                          {districtExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          )}
                        </div>
                      </button>

                      {/* Mandals */}
                      {districtExpanded && (
                        <div className="border-t border-slate-100 bg-white">
                          {district.mandals.map((mandal) => {
                            const mandalPct =
                              totalVotes > 0
                                ? Math.round((mandal.votes / totalVotes) * 100)
                                : 0;
                            return (
                              <div
                                key={mandal.id}
                                className="flex items-center justify-between px-4 py-2 pl-12"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                                  <span className="text-xs text-slate-500 truncate">
                                    {mandal.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                                  <div className="w-10 bg-slate-100 rounded-full h-1 overflow-hidden">
                                    <div
                                      className="h-1 rounded-full bg-slate-300 transition-all duration-700"
                                      style={{ width: `${mandalPct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-slate-400 w-10 text-right">
                                    {mandal.votes.toLocaleString()}
                                  </span>
                                  <span className="text-xs font-medium text-slate-500 w-8 text-right">
                                    {mandalPct}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PollResultsPage() {
  const navigate = useNavigate();
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const poll = MOCK_POLL;
  const totalVotes = poll.totalVotes;

  // Trigger bar animation after mount
  useEffect(() => {
    if (hasVoted) {
      const timer = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [hasVoted]);

  const handleVote = (optionId: number) => {
    setSelectedOptionId(optionId);
    setHasVoted(true);
    toast.success('Your vote has been recorded!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: poll.question,
        text: `Vote on this CivWorld poll: ${poll.question}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success('Poll link copied to clipboard!');
      });
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
    toast.info('Report feature coming soon.');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-4 pb-24">

        {/* Back button */}
        <button
          onClick={() => navigate({ to: '/polls' })}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Polls
        </button>

        {/* ── TOP SECTION ── */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5 mb-4">
          {/* Creator info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={poll.creator.avatar}
              alt={poll.creator.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{poll.creator.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-400">{poll.creator.district}</span>
              </div>
            </div>
            <Badge
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                poll.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              variant="outline"
            >
              {poll.status === 'Active' ? '● Active' : '◉ Closed'}
            </Badge>
          </div>

          {/* Poll question */}
          <h1 className="text-xl font-bold text-slate-800 leading-snug mb-4">
            {poll.question}
          </h1>

          {/* Stats row */}
          <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-slate-700">
                {totalVotes.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">votes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-600">{poll.timeRemaining}</span>
            </div>
          </div>
        </div>

        {/* ── RESULTS / VOTING SECTION ── */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-700">
              {hasVoted ? 'Poll Results' : 'Cast Your Vote'}
            </h2>
            {hasVoted && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                {totalVotes.toLocaleString()} total votes
              </span>
            )}
          </div>

          {hasVoted ? (
            <ResultBars
              options={poll.options}
              totalVotes={totalVotes}
              selectedOptionId={selectedOptionId}
              animated={animated}
            />
          ) : (
            <VotingButtons options={poll.options} onVote={handleVote} />
          )}

          {hasVoted && selectedOptionId && (
            <p className="mt-3 text-xs text-center text-slate-400">
              ✓ You voted for:{' '}
              <span className="font-semibold text-blue-600">
                {poll.options.find((o) => o.id === selectedOptionId)?.text}
              </span>
            </p>
          )}
        </div>

        {/* ── REGION BREAKDOWN SECTION ── */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-bold text-slate-700">Region-wise Breakdown</h2>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Tap a region to expand district and mandal-level data
          </p>
          <RegionAccordion regions={MOCK_REGIONS} totalVotes={totalVotes} />
        </div>

        {/* ── COMMENTS PREVIEW ── */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-bold text-slate-700">Comments</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">
              {MOCK_COMMENTS.length} comments
            </span>
          </div>

          <div className="space-y-4">
            {MOCK_COMMENTS.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img
                  src={comment.avatar}
                  alt={comment.username}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-700">{comment.username}</span>
                    <span className="text-xs text-slate-400">{comment.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full text-center text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors py-2">
            View all comments →
          </button>
        </div>

        {/* ── BOTTOM ACTIONS ── */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
          <div className="flex gap-3 mb-4">
            {/* Share Poll */}
            <Button
              onClick={handleShare}
              className="flex-1 gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Share2 className="w-4 h-4" />
              Share Poll
            </Button>

            {/* View Voters */}
            {poll.isPublic && (
              <Button
                variant="outline"
                className="flex-1 gap-2 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold"
                onClick={() => toast.info('Voter list coming soon.')}
              >
                <Users className="w-4 h-4" />
                View Voters
              </Button>
            )}
          </div>

          {/* Report */}
          <button
            onClick={handleReport}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors mx-auto"
          >
            <Flag className="w-3.5 h-3.5" />
            Report this poll
          </button>
        </div>

      </div>
    </div>
  );
}
