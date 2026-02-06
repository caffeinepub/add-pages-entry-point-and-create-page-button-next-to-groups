import { CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function VerifiedBadge({ size = 'md', className = '' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CheckCircle2 
            className={`${sizeClasses[size]} text-[oklch(0.45_0.12_250)] fill-[oklch(0.45_0.12_250)] ${className}`}
            aria-label="Verified account"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">Verified Account</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
