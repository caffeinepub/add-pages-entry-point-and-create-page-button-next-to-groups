import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeDisplayProps {
  badges: string[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
}

const BADGE_INFO: Record<string, { name: string; icon: string; color: string }> = {
  'debater': { name: 'Debater', icon: '/assets/generated/debate-badge.dim_64x64.png', color: 'text-blue-600' },
  'policy_maker': { name: 'Policy Maker', icon: '/assets/generated/policy-maker-badge.dim_64x64.png', color: 'text-purple-600' },
  'community_leader': { name: 'Community Leader', icon: '/assets/generated/community-leader-badge.dim_64x64.png', color: 'text-green-600' },
  'event_organizer': { name: 'Event Organizer', icon: '/assets/generated/event-organizer-badge.dim_64x64.png', color: 'text-orange-600' },
  'group_builder': { name: 'Group Builder', icon: '/assets/generated/group-builder-badge.dim_64x64.png', color: 'text-indigo-600' },
  'civic_participant': { name: 'Civic Participant', icon: '/assets/generated/civic-participant-badge.dim_64x64.png', color: 'text-teal-600' },
};

export default function BadgeDisplay({ badges, size = 'md', maxDisplay }: BadgeDisplayProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remainingCount = maxDisplay && badges.length > maxDisplay ? badges.length - maxDisplay : 0;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {displayBadges.map((badge) => {
          const badgeInfo = BADGE_INFO[badge];
          if (!badgeInfo) return null;

          return (
            <Tooltip key={badge}>
              <TooltipTrigger asChild>
                <img
                  src={badgeInfo.icon}
                  alt={badgeInfo.name}
                  className={`${sizeClasses[size]} object-contain cursor-help`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{badgeInfo.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {remainingCount > 0 && (
          <span className="text-xs text-muted-foreground ml-1">+{remainingCount}</span>
        )}
      </div>
    </TooltipProvider>
  );
}
