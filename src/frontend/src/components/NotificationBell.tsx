import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  CheckCheck,
  Landmark,
  Megaphone,
  Users,
  Wrench,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { CivicNotification } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(timestampNs: bigint): string {
  const ms = Number(timestampNs / 1_000_000n);
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface CategoryConfig {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  civic_issue: {
    icon: Wrench,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  poll: {
    icon: BarChart2,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  leader_update: {
    icon: Landmark,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  community: {
    icon: Users,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  announcement: {
    icon: Megaphone,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
};

function getCategoryConfig(category: string): CategoryConfig {
  return (
    CATEGORY_CONFIG[category] ?? {
      icon: Bell,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
    }
  );
}

// ─── Dropdown Notification Item ───────────────────────────────────────────────

interface DropdownNotificationItemProps {
  notification: CivicNotification;
  onMarkRead: (id: bigint) => void;
  onClose: () => void;
}

function DropdownNotificationItem({
  notification,
  onMarkRead,
  onClose,
}: DropdownNotificationItemProps) {
  const navigate = useNavigate();
  const config = getCategoryConfig(notification.category);
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.notificationId);
    }
    onClose();
    navigate({ to: "/notifications" });
  };

  return (
    <button
      type="button"
      className={`w-full flex gap-2.5 p-3 text-left transition-colors rounded-lg ${
        notification.isRead
          ? "hover:bg-secondary/60"
          : "bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/20 dark:hover:bg-blue-900/30"
      }`}
      onClick={handleClick}
    >
      {/* Icon circle */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.iconBg}`}
      >
        <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className="text-xs font-semibold text-foreground line-clamp-1 flex-1">
            {notification.title}
          </p>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {timeAgo(notification.timestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {notification.message}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationBell() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAuthenticated = !!identity;
  const actorReady = !!actor && !actorFetching;

  // Poll unread count every 30s
  const { data: unreadCount = 0n } = useQuery<bigint>({
    queryKey: ["unreadNotificationCount"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getUnreadCivicNotificationCount();
    },
    enabled: isAuthenticated && actorReady,
    refetchInterval: 30000,
  });

  // Fetch notifications for dropdown (when open)
  const { data: allNotifications = [] } = useQuery<CivicNotification[]>({
    queryKey: ["civicNotifications", null],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCivicNotifications(null);
    },
    enabled: isAuthenticated && actorReady && open,
  });

  const dropdownNotifications = allNotifications.slice(0, 10);

  // Manual polling for unread count using setInterval (backup)
  useEffect(() => {
    if (!isAuthenticated) return;
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    }, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, queryClient]);

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: bigint) => {
      if (!actor) throw new Error("Actor not available.");
      return actor.markCivicNotificationRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["civicNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available.");
      return actor.markAllCivicNotificationsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["civicNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  if (!isAuthenticated) return null;

  const unreadNumber = Number(unreadCount);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-ocid="notification_bell.button"
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
          aria-label={`Notifications${unreadNumber > 0 ? `, ${unreadNumber} unread` : ""}`}
        >
          <Bell className="w-4 h-4" />
          {unreadNumber > 0 && (
            <span
              className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center leading-none"
              aria-hidden="true"
            >
              {unreadNumber > 99 ? "99+" : unreadNumber}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        data-ocid="notification_bell.dropdown_menu"
        className="w-80 p-0 rounded-2xl shadow-xl border border-border overflow-hidden"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              Notifications
            </span>
            {unreadNumber > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold leading-none">
                {unreadNumber}
              </span>
            )}
          </div>
          {unreadNumber > 0 && (
            <Button
              data-ocid="notification_bell.mark_all_button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-primary hover:text-primary"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="w-3 h-3" />
              Mark all
            </Button>
          )}
        </div>

        {/* Notification List */}
        <ScrollArea className="max-h-[400px]">
          <div className="p-2 space-y-0.5">
            {dropdownNotifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            ) : (
              dropdownNotifications.map((notification) => (
                <DropdownNotificationItem
                  key={notification.notificationId.toString()}
                  notification={notification}
                  onMarkRead={(id) => markReadMutation.mutate(id)}
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {dropdownNotifications.length > 0 && (
          <div className="border-t border-border p-2">
            <Button
              data-ocid="notification_bell.view_all_link"
              variant="ghost"
              className="w-full h-9 text-xs text-primary hover:text-primary hover:bg-primary/5 rounded-lg"
              onClick={() => {
                setOpen(false);
                navigate({ to: "/notifications" });
              }}
            >
              View all notifications →
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
