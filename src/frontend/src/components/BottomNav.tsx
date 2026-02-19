import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, Video, Calendar, Film, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BottomNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isGroupsOrPagesActive = currentPath.startsWith('/groups') || currentPath.startsWith('/pages') || currentPath === '/groups-and-pages';

  const navItems = [
    { path: '/', icon: Home, label: 'Home', type: 'lucide' as const },
    { path: '/video', icon: Video, label: 'Video', type: 'lucide' as const },
    { path: '/reel', icon: Film, label: 'Reel', type: 'lucide' as const },
    { path: '/events', icon: Calendar, label: 'Events', type: 'lucide' as const },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
      <div className="container max-w-2xl mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || 
              (item.path === '/events' && currentPath.startsWith('/events'));
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={`flex flex-col items-center gap-1 h-auto py-2 px-2 hover:bg-transparent ${
                  isActive
                    ? 'text-[oklch(0.45_0.12_250)]'
                    : 'text-muted-foreground hover:text-[oklch(0.45_0.12_250)]'
                }`}
                onClick={() => navigate({ to: item.path })}
              >
                <item.icon className={`h-6 w-6 ${isActive ? 'fill-current' : ''}`} />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Button>
            );
          })}

          {/* Wallet tab */}
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-auto py-2 px-2 hover:bg-transparent ${
              currentPath === '/wallet'
                ? 'text-[oklch(0.45_0.12_250)]'
                : 'text-muted-foreground hover:text-[oklch(0.45_0.12_250)]'
            }`}
            onClick={() => navigate({ to: '/wallet' })}
          >
            <Wallet className={`h-6 w-6 ${currentPath === '/wallet' ? 'fill-current' : ''}`} />
            <span className={`text-xs font-medium ${currentPath === '/wallet' ? 'font-semibold' : ''}`}>
              Wallet
            </span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
