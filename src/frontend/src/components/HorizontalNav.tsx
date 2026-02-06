import { useNavigate, useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { MessageSquare, BarChart3, MapPin } from 'lucide-react';

export default function HorizontalNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      id: 'discussions',
      label: 'Discussions',
      icon: MessageSquare,
      path: '/discussions',
    },
    {
      id: 'polls',
      label: 'Polls',
      icon: BarChart3,
      path: '/polls',
    },
    {
      id: 'myconstituency',
      label: 'My Constituency',
      icon: MapPin,
      path: '/myconstituency',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="horizontal-nav bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <Button
                key={tab.id}
                onClick={() => navigate({ to: tab.path })}
                variant="ghost"
                className={`
                  relative px-6 py-6 rounded-none font-medium transition-all duration-200
                  ${active 
                    ? 'text-[oklch(0.45_0.12_250)] bg-[oklch(0.45_0.12_250)]/10' 
                    : 'text-[oklch(0.30_0.05_250)] hover:text-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.45_0.12_250)]/5'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-[oklch(0.45_0.12_250)] rounded-t-full" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
