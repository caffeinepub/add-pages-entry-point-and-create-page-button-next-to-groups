import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Home, Film, MessageSquare, BarChart2, Users } from 'lucide-react';

const navItems = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Reels', icon: Film, path: '/reels' },
  { label: 'Discuss', icon: MessageSquare, path: '/discussions' },
  { label: 'Polls', icon: BarChart2, path: '/polls' },
  { label: 'Communities', icon: Users, path: '/communities' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border safe-area-bottom">
      <div className="flex items-center h-16">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => navigate({ to: path })}
              className={`flex-1 flex flex-col items-center justify-center gap-1 h-full min-h-[52px] transition-all ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-primary/15' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-primary' : ''}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
