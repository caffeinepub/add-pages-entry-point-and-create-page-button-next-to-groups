import { useNavigate, useLocation } from '@tanstack/react-router';
import { User, Wallet, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useView } from '../context/ViewContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentView, setCurrentView } = useView();
  const { identity, login, clear, loginStatus, isInitializing } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const isWalletActive = location.pathname === '/wallet' || location.pathname === '/wallet-points';

  const handleAppToggle = () => {
    setCurrentView('app');
    navigate({ to: '/' });
  };

  const handleWalletToggle = () => {
    setCurrentView('wallet');
    navigate({ to: '/wallet' });
  };

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const greeting = userProfile?.name
    ? `Hi, ${userProfile.name.split(' ')[0]}`
    : isAuthenticated
    ? 'Welcome back'
    : 'CivWorld';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border/30 shadow-sm">
      <div className="flex items-center justify-between px-3 py-2.5 gap-2">
        {/* Left: Greeting */}
        <div className="flex-shrink-0 min-w-0 max-w-[90px]">
          <p className="text-[10px] text-muted-foreground font-medium truncate">Good day 👋</p>
          <h1 className="text-sm font-bold text-foreground leading-tight truncate">{greeting}</h1>
        </div>

        {/* Center: App / Wallet Toggle */}
        <div className="flex items-center bg-muted/60 rounded-full p-1 gap-1 flex-shrink-0">
          <button
            onClick={handleAppToggle}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 min-h-[32px] ${
              !isWalletActive
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            App
          </button>
          <button
            onClick={handleWalletToggle}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 min-h-[32px] ${
              isWalletActive
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Wallet
          </button>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center justify-end gap-1 flex-shrink-0">
          {/* Wallet icon */}
          <button
            onClick={() => navigate({ to: '/wallet' })}
            className="p-2 rounded-full hover:bg-muted/60 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Wallet"
          >
            <Wallet size={18} className="text-muted-foreground" />
          </button>

          {/* Profile icon (only when authenticated) */}
          {isAuthenticated && (
            <button
              onClick={() => navigate({ to: '/profile' })}
              className="p-2 rounded-full hover:bg-muted/60 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Profile"
            >
              <User size={18} className="text-muted-foreground" />
            </button>
          )}

          {/* Login / Logout button */}
          <button
            onClick={handleAuth}
            disabled={isLoggingIn || isInitializing}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 min-h-[36px] disabled:opacity-60 ${
              isAuthenticated
                ? 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
            }`}
            aria-label={isAuthenticated ? 'Logout' : 'Login'}
          >
            {isLoggingIn ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isAuthenticated ? (
              <LogOut size={14} />
            ) : (
              <LogIn size={14} />
            )}
            <span className="hidden xs:inline">
              {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
