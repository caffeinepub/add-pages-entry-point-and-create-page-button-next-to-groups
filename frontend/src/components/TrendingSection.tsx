import { useNavigate } from '@tanstack/react-router';
import { useGetTrendingHashtags } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Hash } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TrendingSectionProps {
  selectedHashtag?: string | null;
  onHashtagClick?: (hashtag: string) => void;
}

export default function TrendingSection({ selectedHashtag, onHashtagClick }: TrendingSectionProps) {
  const navigate = useNavigate();
  const { data: trendingHashtags, isLoading, dataUpdatedAt } = useGetTrendingHashtags();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Trigger shimmer animation when data updates
  useEffect(() => {
    if (dataUpdatedAt) {
      setIsRefreshing(true);
      const timer = setTimeout(() => setIsRefreshing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [dataUpdatedAt]);

  const handleHashtagClick = (hashtag: string) => {
    if (onHashtagClick) {
      onHashtagClick(hashtag);
    } else {
      // Navigate to topic page
      navigate({ to: '/topic/$topic', params: { topic: encodeURIComponent(hashtag) } });
    }
  };

  if (isLoading && !trendingHashtags) {
    return (
      <div className="bg-white border border-border rounded-lg p-4 shadow-sm mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Hash className="h-5 w-5 text-[oklch(0.45_0.12_250)]" />
          Trending
        </h3>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-32 bg-muted animate-pulse rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-lg p-4 shadow-sm mb-4">
      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <Hash className="h-5 w-5 text-[oklch(0.45_0.12_250)]" />
        Trending
      </h3>
      
      {!trendingHashtags || trendingHashtags.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No trending topics yet</p>
      ) : (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className={`flex gap-2 pb-2 transition-opacity duration-500 ${isRefreshing ? 'animate-shimmer' : ''}`}>
            {trendingHashtags.map((hashtag) => (
              <Button
                key={hashtag.word}
                variant={selectedHashtag === hashtag.word ? 'default' : 'outline'}
                size="sm"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  selectedHashtag === hashtag.word
                    ? 'bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white'
                    : 'border-[oklch(0.45_0.12_250)]/30 text-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.45_0.12_250)]/10'
                }`}
                onClick={() => handleHashtagClick(hashtag.word)}
              >
                <span>{hashtag.word}</span>
                <span className={`text-xs font-normal px-1.5 py-0.5 rounded-full ${
                  selectedHashtag === hashtag.word
                    ? 'bg-white/20'
                    : 'bg-[oklch(0.45_0.12_250)]/10'
                }`}>
                  {Number(hashtag.count)}
                </span>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
