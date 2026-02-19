import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useGetUserNotifications, useMarkNotificationsAsRead } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Settings, MessageSquare, Bell, Search, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import BuildInfoIndicator from './BuildInfoIndicator';

interface HeaderProps {
  onNavigateToMessages?: () => void;
  showMessagesButton?: boolean;
}

export default function Header({ onNavigateToMessages, showMessagesButton = false }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: notifications } = useGetUserNotifications();
  const markAsRead = useMarkNotificationsAsRead();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleAuthOrProfile = async () => {
    if (isAuthenticated) {
      navigate({ to: '/profile' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleNotificationClick = () => {
    if (unreadCount > 0) {
      markAsRead.mutate();
    }
  };

  return (
    <header className="bg-[oklch(0.45_0.12_250)] text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">CivWorld</h1>
        
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              <Button
                onClick={() => navigate({ to: '/wallet' })}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                title="Wallet"
              >
                <Wallet className="h-6 w-6" />
              </Button>

              <Button
                onClick={() => navigate({ to: '/explore' })}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <Search className="h-6 w-6" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 relative"
                    onClick={handleNotificationClick}
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-lg">Notifications</h3>
                  </div>
                  <ScrollArea className="h-96">
                    {notifications && notifications.length > 0 ? (
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div
                            key={notification.notificationId.toString()}
                            className={`p-4 hover:bg-muted/50 transition-colors ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                          >
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(Number(notification.timestamp) / 1000000), { addSuffix: true })}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {showMessagesButton && onNavigateToMessages && (
                <Button
                  onClick={onNavigateToMessages}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <MessageSquare className="h-6 w-6" />
                </Button>
              )}
            </>
          )}

          <Button
            onClick={handleAuthOrProfile}
            disabled={disabled}
            variant="secondary"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            {disabled ? 'Logging in...' : isAuthenticated ? 'Profile' : 'Login'}
          </Button>

          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <Settings className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <BuildInfoIndicator />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
