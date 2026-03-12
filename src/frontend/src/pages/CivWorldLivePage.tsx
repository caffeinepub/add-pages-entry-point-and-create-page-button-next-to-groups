import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Archive, CalendarClock, ChevronRight, Radio, Tv } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { LiveSession } from "../backend.d";
import { LiveSessionStatus } from "../backend.d";
import CreateLiveSessionModal from "../components/CreateLiveSessionModal";
import LiveSessionCard from "../components/LiveSessionCard";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function CivWorldLivePage() {
  const navigate = useNavigate();
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const isVerifiedLeader = userProfile?.verifiedStatus === true;

  const activeQuery = useQuery<LiveSession[]>({
    queryKey: ["activeSessions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getActiveSessions();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10_000,
  });

  const scheduledQuery = useQuery<LiveSession[]>({
    queryKey: ["scheduledSessions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getScheduledSessions();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30_000,
  });

  const archiveQuery = useQuery<LiveSession[]>({
    queryKey: ["leaderArchive"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getLeaderArchive();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });

  const activeSessions = activeQuery.data ?? [];
  const scheduledSessions = scheduledQuery.data ?? [];
  const archivedSessions = archiveQuery.data ?? [];

  function handleNotifyMe(session: LiveSession) {
    toast.success(`You'll be notified when "${session.title}" starts`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                CivWorld Live
              </h1>
              <p className="text-xs text-primary-foreground/70">
                Leaders Voice
              </p>
            </div>
          </div>

          {isVerifiedLeader && (
            <div className="flex gap-2">
              <CreateLiveSessionModal
                defaultGoLive
                trigger={
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md"
                    data-ocid="live.go_live_button"
                  >
                    <Radio className="w-3.5 h-3.5 mr-1" />
                    Go Live
                  </Button>
                }
              />
              <CreateLiveSessionModal
                defaultGoLive={false}
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs border-white/30 text-white hover:bg-white/20 rounded-lg"
                    data-ocid="live.schedule_button"
                  >
                    <CalendarClock className="w-3.5 h-3.5 mr-1" />
                    Schedule
                  </Button>
                }
              />
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-primary-foreground/80 text-xs">
              {activeSessions.length} Live Now
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarClock className="w-3 h-3 text-amber-300" />
            <span className="text-primary-foreground/80 text-xs">
              {scheduledSessions.length} Upcoming
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Archive className="w-3 h-3 text-primary-foreground/60" />
            <span className="text-primary-foreground/80 text-xs">
              {archivedSessions.length} Archived
            </span>
          </div>
        </div>
      </div>

      {/* Not verified info banner */}
      {identity && !isVerifiedLeader && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-2">
          <span className="text-amber-500 text-xs">⚡</span>
          <p className="text-xs text-amber-700">
            Get verified as a leader to host live sessions
          </p>
          <ChevronRight className="w-3 h-3 text-amber-500 ml-auto" />
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 pt-4">
        <Tabs defaultValue="live">
          <TabsList className="w-full grid grid-cols-3 rounded-xl bg-muted/50 h-10">
            <TabsTrigger
              value="live"
              className="rounded-lg text-xs font-medium data-[state=active]:bg-red-500 data-[state=active]:text-white"
              data-ocid="live.tab.1"
            >
              <Radio className="w-3 h-3 mr-1" />
              Live Now
              {activeSessions.length > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-red-500">
                  {activeSessions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="scheduled"
              className="rounded-lg text-xs font-medium"
              data-ocid="live.tab.2"
            >
              <CalendarClock className="w-3 h-3 mr-1" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="archive"
              className="rounded-lg text-xs font-medium"
              data-ocid="live.tab.3"
            >
              <Archive className="w-3 h-3 mr-1" />
              Archive
            </TabsTrigger>
          </TabsList>

          {/* Live Now */}
          <TabsContent value="live" className="mt-4 space-y-3 pb-8">
            {activeQuery.isLoading || actorFetching ? (
              <LoadingSkeleton />
            ) : activeSessions.length === 0 ? (
              <EmptyState
                icon="📡"
                title="No live sessions right now"
                description="Check back later or see upcoming scheduled sessions"
              />
            ) : (
              <AnimatePresence>
                {activeSessions.map((session, i) => (
                  <motion.div
                    key={session.id.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <LiveSessionCard
                      session={session}
                      onJoin={() =>
                        navigate({ to: `/live/${session.id.toString()}` })
                      }
                      index={i + 1}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </TabsContent>

          {/* Scheduled */}
          <TabsContent value="scheduled" className="mt-4 space-y-3 pb-8">
            {scheduledQuery.isLoading || actorFetching ? (
              <LoadingSkeleton />
            ) : scheduledSessions.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No upcoming sessions"
                description="Leaders haven't scheduled any sessions yet"
              />
            ) : (
              <AnimatePresence>
                {scheduledSessions.map((session, i) => (
                  <motion.div
                    key={session.id.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative"
                  >
                    <LiveSessionCard
                      session={session}
                      onJoin={() =>
                        navigate({ to: `/live/${session.id.toString()}` })
                      }
                      index={i + 1}
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleNotifyMe(session)}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      >
                        🔔 Notify Me
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </TabsContent>

          {/* Archive */}
          <TabsContent value="archive" className="mt-4 space-y-3 pb-8">
            {archiveQuery.isLoading || actorFetching ? (
              <LoadingSkeleton />
            ) : archivedSessions.length === 0 ? (
              <EmptyState
                icon="🗂️"
                title="No archived sessions yet"
                description="Completed live sessions will appear here"
              />
            ) : (
              <AnimatePresence>
                {archivedSessions.map((session, i) => (
                  <motion.div
                    key={session.id.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <LiveSessionCard
                      session={session}
                      onJoin={() =>
                        navigate({ to: `/live/${session.id.toString()}` })
                      }
                      index={i + 1}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      data-ocid="live.empty_state"
    >
      <span className="text-4xl mb-3">{icon}</span>
      <p className="font-medium text-foreground text-sm mb-1">{title}</p>
      <p className="text-xs text-muted-foreground max-w-[240px]">
        {description}
      </p>
    </div>
  );
}
