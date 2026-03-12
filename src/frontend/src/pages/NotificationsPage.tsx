import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  BellOff,
  CheckCheck,
  Landmark,
  Megaphone,
  Users,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { CivicNotification } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

type NotificationCategory =
  | "all"
  | "civic_issue"
  | "poll"
  | "leader_update"
  | "community"
  | "announcement";

interface CategoryConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  civic_issue: {
    label: "Civic Issue",
    icon: Wrench,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  poll: {
    label: "Poll",
    icon: BarChart2,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  leader_update: {
    label: "Leader Update",
    icon: Landmark,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  community: {
    label: "Community",
    icon: Users,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  announcement: {
    label: "Announcement",
    icon: Megaphone,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
};

function getCategoryConfig(category: string): CategoryConfig {
  return (
    CATEGORY_CONFIG[category] ?? {
      label: "Notification",
      icon: Bell,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
    }
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

interface NotificationCardProps {
  notification: CivicNotification;
  index: number;
  onMarkRead: (id: bigint) => void;
}

function NotificationCard({
  notification,
  index,
  onMarkRead,
}: NotificationCardProps) {
  const config = getCategoryConfig(notification.category);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      data-ocid={`notifications.item.${index + 1}`}
      className={`relative flex gap-3 p-4 cursor-pointer transition-colors rounded-xl border ${
        notification.isRead
          ? "bg-background border-border"
          : "bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30"
      } hover:bg-secondary/60`}
      onClick={() => {
        if (!notification.isRead) {
          onMarkRead(notification.notificationId);
        }
      }}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}

      {/* Icon circle */}
      <div
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.iconBg}`}
      >
        <Icon className={`w-4.5 h-4.5 ${config.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        {notification.locationTarget && (
          <p className="text-xs text-primary/70 mt-1">
            📍 {notification.locationTarget}
          </p>
        )}
      </div>

      {/* Time */}
      <div className="shrink-0 text-xs text-muted-foreground whitespace-nowrap mt-0.5">
        {timeAgo(notification.timestamp)}
      </div>
    </motion.div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex gap-3 p-4 rounded-xl border border-border">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <Skeleton className="h-3 w-12 shrink-0 mt-1" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<NotificationCategory>("all");

  const isAuthenticated = !!identity;

  // Map tab value to backend category param
  const categoryParam: string | null =
    activeFilter === "all" ? null : activeFilter;

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery<CivicNotification[]>({
    queryKey: ["civicNotifications", categoryParam],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCivicNotifications(categoryParam);
    },
    enabled: isAuthenticated && !!actor && !actorFetching,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: bigint) => {
      if (!actor) throw new Error("Actor not available.");
      return actor.markCivicNotificationRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["civicNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
    onError: () => {
      toast.error("Failed to mark notification as read.");
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
      toast.success("All notifications marked as read.");
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read.");
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const tabs: { value: NotificationCategory; label: string }[] = [
    { value: "all", label: "All" },
    { value: "civic_issue", label: "Civic Issues" },
    { value: "poll", label: "Polls" },
    { value: "leader_update", label: "Leaders" },
    { value: "community", label: "Community" },
    { value: "announcement", label: "Announcements" },
  ];

  if (!isAuthenticated) {
    return (
      <div
        data-ocid="notifications.page"
        className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Bell className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Sign in to see notifications
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Stay updated with civic issues, polls, leader updates, and
          announcements in your constituency.
        </p>
        <Button onClick={() => navigate({ to: "/" })} className="rounded-full">
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div data-ocid="notifications.page" className="max-w-2xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            data-ocid="notifications.mark_all_button"
            variant="outline"
            size="sm"
            className="rounded-full text-xs gap-1.5"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={activeFilter}
        onValueChange={(v) => setActiveFilter(v as NotificationCategory)}
        className="mb-6"
      >
        <TabsList
          data-ocid="notifications.filter.tab"
          className="w-full h-auto p-1 flex overflow-x-auto gap-0.5 bg-muted rounded-xl"
          style={{ scrollbarWidth: "none" }}
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="shrink-0 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Notification List */}
      {isLoading ? (
        <div data-ocid="notifications.loading_state" className="space-y-3">
          {["sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
            <NotificationSkeleton key={k} />
          ))}
        </div>
      ) : isError ? (
        <div
          data-ocid="notifications.error_state"
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <BellOff className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Failed to load notifications. Please try again.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["civicNotifications"],
              })
            }
          >
            Retry
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div
          data-ocid="notifications.empty_state"
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Bell className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">No notifications yet</p>
          <p className="text-muted-foreground text-sm max-w-xs">
            {activeFilter === "all"
              ? "You'll be notified about civic issues, polls, and updates in your constituency."
              : `No ${tabs.find((t) => t.value === activeFilter)?.label?.toLowerCase()} notifications yet.`}
          </p>
        </div>
      ) : (
        <div data-ocid="notifications.list" className="space-y-2">
          <AnimatePresence initial={false}>
            {notifications.map((notification, index) => (
              <NotificationCard
                key={notification.notificationId.toString()}
                notification={notification}
                index={index}
                onMarkRead={(id) => markReadMutation.mutate(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
