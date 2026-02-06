import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, Video, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BottomNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navItems = [
    { path: '/', icon: Home, label: 'Home', type: 'lucide' as const },
    { path: '/video', icon: Video, label: 'Video', type: 'lucide' as const },
    { path: '/events', icon: Calendar, label: 'Events', type: 'lucide' as const },
    { path: '/groups', iconSrc: '/assets/generated/groups-icon.dim_32x32.png', label: 'Groups', type: 'image' as const },
    { path: '/pages', iconSrc: '/assets/generated/pages-icon.dim_32x32.png', label: 'Pages', type: 'image' as const },
    { path: '/profile', icon: User, label: 'Profile', type: 'lucide' as const },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
      <div className="container max-w-2xl mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || 
              (item.path === '/events' && currentPath.startsWith('/events')) ||
              (item.path === '/groups' && currentPath.startsWith('/groups')) ||
              (item.path === '/pages' && currentPath.startsWith('/pages'));
            
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
                {item.type === 'lucide' && item.icon ? (
                  <item.icon className={`h-6 w-6 ${isActive ? 'fill-current' : ''}`} />
                ) : (
                  <img 
                    src={item.iconSrc} 
                    alt={`${item.label} icon`}
                    className={`h-6 w-6 ${isActive ? 'opacity-100' : 'opacity-60'}`}
                    style={isActive ? { filter: 'brightness(0) saturate(100%) invert(28%) sepia(73%) saturate(1234%) hue-rotate(210deg) brightness(95%) contrast(92%)' } : {}}
                  />
                )}
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
