import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUp,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  Play,
  Radio,
  Reply,
  ShieldAlert,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import type { LiveComment, LiveReaction, LiveSession } from "../backend.d";
import { LiveReactionType, LiveSessionStatus } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

import { formatBackendError } from "../utils/backendErrors";
import {
  formatRelativeTime,
  formatScheduledTime,
  getCountdown,
  getInitials,
  getReactionEmoji,
  shortenPrincipal,
} from "../utils/liveUtils";

// ─── Floating Emoji Bubble ────────────────────────────────────────────────────

interface EmojiFloat {
  id: string;
  emoji: string;
  x: number;
}

function FloatingEmojiBubble({ emoji, x }: { emoji: string; x: number }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -100, scale: 1.4 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: "easeOut" }}
      className="absolute bottom-0 pointer-events-none select-none text-2xl z-20"
      style={{ left: `${x}%` }}
    >
      {emoji}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LiveSessionPage() {
  const params = useParams({ from: "/live/$sessionId" });
  const sessionId = BigInt(params.sessionId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const [commentTab, setCommentTab] = useState<"questions" | "comments">(
    "questions",
  );
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<bigint | null>(null);
  const [replyText, setReplyText] = useState("");
  const [moderationDialogOpen, setModerationDialogOpen] = useState(false);
  const [moderationTarget, setModerationTarget] = useState<bigint | null>(null);
  const [moderationReason, setModerationReason] = useState("");
  const [moderationPanelOpen, setModerationPanelOpen] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<EmojiFloat[]>([]);
  const [hasIncrementedViewer, setHasIncrementedViewer] = useState(false);

  // Fetch session
  const sessionQuery = useQuery<LiveSession | null>({
    queryKey: ["liveSession", sessionId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getLiveSession(sessionId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 8_000,
  });

  // Fetch comments
  const commentsQuery = useQuery<LiveComment[]>({
    queryKey: ["sessionComments", sessionId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSessionComments(sessionId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 8_000,
  });

  // Fetch reactions
  const reactionsQuery = useQuery<LiveReaction[]>({
    queryKey: ["sessionReactions", sessionId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSessionReactions(sessionId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 8_000,
  });

  const session = sessionQuery.data;
  const comments = commentsQuery.data ?? [];
  const reactions = reactionsQuery.data ?? [];
  const sessionStatus = session?.status as unknown as string | undefined;

  const isLeader =
    session && identity
      ? session.leader.toString() === identity.getPrincipal().toString()
      : false;

  // Increment viewer count once when joining a live session
  useEffect(() => {
    if (!actor || !session || hasIncrementedViewer) return;
    if (sessionStatus !== LiveSessionStatus.live) return;
    setHasIncrementedViewer(true);
    actor.incrementSessionViewers(sessionId).catch(() => {});
  }, [actor, session, sessionStatus, hasIncrementedViewer, sessionId]);

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const startMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      await actor.startLiveSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["liveSession", sessionId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      toast.success("You're live! 🔴");
    },
    onError: (e: unknown) => toast.error(formatBackendError(e)),
  });

  const endMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      await actor.endLiveSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["liveSession", sessionId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["leaderArchive"] });
      toast.success("Session ended.");
    },
    onError: (e: unknown) => toast.error(formatBackendError(e)),
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({
      content,
      parentId,
    }: { content: string; parentId: bigint | null }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      return actor.addLiveComment(sessionId, content, parentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sessionComments", sessionId.toString()],
      });
      setCommentText("");
      setReplyingTo(null);
      setReplyText("");
    },
    onError: (e: unknown) => toast.error(formatBackendError(e)),
  });

  const upvoteMutation = useMutation({
    mutationFn: async (commentId: bigint) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      await actor.upvoteQuestion(sessionId, commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sessionComments", sessionId.toString()],
      });
    },
    onError: (e: unknown) => toast.error(formatBackendError(e)),
  });

  const reactionMutation = useMutation({
    mutationFn: async (reactionType: LiveReactionType) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      await actor.addLiveReaction(sessionId, reactionType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sessionReactions", sessionId.toString()],
      });
    },
    onError: () => {},
  });

  const moderateMutation = useMutation({
    mutationFn: async ({
      commentId,
      reason,
    }: { commentId: bigint; reason: string }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      await actor.moderateLiveComment(sessionId, commentId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sessionComments", sessionId.toString()],
      });
      setModerationDialogOpen(false);
      setModerationReason("");
      setModerationTarget(null);
      toast.success("Comment moderated.");
    },
    onError: (e: unknown) => toast.error(formatBackendError(e)),
  });

  // ─── Reaction handler ───────────────────────────────────────────────────────

  function handleReaction(type: LiveReactionType) {
    const emoji = getReactionEmoji(type);
    const id = `${Date.now()}-${Math.random()}`;
    const x = 10 + Math.random() * 80;
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 2100);
    reactionMutation.mutate(type);
    toast(emoji, { duration: 800 });
  }

  // ─── Comment processing ─────────────────────────────────────────────────────

  const topLevelComments = comments.filter((c) => !c.parentCommentId);
  const replyComments = comments.filter((c) => !!c.parentCommentId);

  const questions = topLevelComments
    .slice()
    .sort((a, b) => b.upvotes.length - a.upvotes.length);
  const regularComments = topLevelComments
    .slice()
    .sort((a, b) => Number(b.timestamp - a.timestamp));

  const displayedComments =
    commentTab === "questions" ? questions : regularComments;

  // Aggregate reactions
  const reactionCounts = reactions.reduce<Record<string, number>>((acc, r) => {
    const type = r.reactionType as unknown as string;
    acc[type] = (acc[type] ?? 0) + 1;
    return acc;
  }, {});

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (sessionQuery.isLoading || actorFetching) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <p className="text-muted-foreground">Session not found.</p>
        <Button variant="outline" onClick={() => navigate({ to: "/live" })}>
          Back to CivWorld Live
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Back nav */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/live" })}
          className="h-8 w-8 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{session.title}</p>
          <p className="text-[11px] text-muted-foreground">CivWorld Live</p>
        </div>
        {sessionStatus === LiveSessionStatus.live && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Session info */}
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight mb-2">
            {session.title}
          </h1>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="text-xs rounded-full">
              {session.topic}
            </Badge>
            <Badge className="text-xs rounded-full bg-primary/10 text-primary border-0">
              <MapPin className="w-3 h-3 mr-1" />
              {session.constituency}
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {getInitials(session.leader)}
              </div>
              <span className="text-sm text-foreground font-medium">
                {shortenPrincipal(session.leader)}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-medium">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Verified Leader
              </span>
            </div>
          </div>

          {sessionStatus === LiveSessionStatus.live && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{session.viewerCount.toString()} watching</span>
            </div>
          )}
        </div>

        {/* Video / Status area */}
        <div className="relative rounded-2xl overflow-hidden">
          {sessionStatus === LiveSessionStatus.live && (
            <VideoPlaceholder leaderName={shortenPrincipal(session.leader)} />
          )}
          {sessionStatus === LiveSessionStatus.scheduled && (
            <ScheduledPlaceholder scheduledTime={session.scheduledTime} />
          )}
          {sessionStatus === LiveSessionStatus.ended && <EndedPlaceholder />}

          {/* Floating emojis */}
          {sessionStatus === LiveSessionStatus.live && (
            <div className="absolute bottom-16 left-0 right-0 h-24 overflow-hidden pointer-events-none">
              <AnimatePresence>
                {floatingEmojis.map((e) => (
                  <FloatingEmojiBubble key={e.id} emoji={e.emoji} x={e.x} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Reaction bar (only for live sessions) */}
          {sessionStatus === LiveSessionStatus.live && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {(
                    [
                      {
                        type: LiveReactionType.fire,
                        emoji: "🔥",
                        ocid: "session.reaction.fire_button",
                      },
                      {
                        type: LiveReactionType.heart,
                        emoji: "❤️",
                        ocid: "session.reaction.heart_button",
                      },
                      {
                        type: LiveReactionType.clap,
                        emoji: "👏",
                        ocid: "session.reaction.clap_button",
                      },
                      {
                        type: LiveReactionType.wave,
                        emoji: "👋",
                        ocid: "session.reaction.wave_button",
                      },
                    ] as const
                  ).map(({ type, emoji, ocid }) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => handleReaction(type)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/30 backdrop-blur text-white text-sm hover:bg-black/50 transition-all active:scale-95"
                      data-ocid={ocid}
                    >
                      <span>{emoji}</span>
                      {reactionCounts[type] ? (
                        <span className="text-[10px]">
                          {reactionCounts[type]}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leader controls */}
        {isLeader && (
          <div className="flex gap-2">
            {sessionStatus === LiveSessionStatus.scheduled && (
              <Button
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl"
                data-ocid="session.start_button"
              >
                {startMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Radio className="w-4 h-4 mr-2" />
                )}
                Start Live Session
              </Button>
            )}
            {sessionStatus === LiveSessionStatus.live && (
              <Button
                variant="destructive"
                onClick={() => endMutation.mutate()}
                disabled={endMutation.isPending}
                className="flex-1 rounded-xl"
                data-ocid="session.end_button"
              >
                {endMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                End Session
              </Button>
            )}
          </div>
        )}

        <Separator />

        {/* Comments/Questions section */}
        <div>
          {/* Tab switcher */}
          <div className="flex gap-1 mb-4 p-1 bg-muted/50 rounded-xl">
            <button
              type="button"
              onClick={() => setCommentTab("questions")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                commentTab === "questions"
                  ? "bg-card shadow-soft text-foreground"
                  : "text-muted-foreground"
              }`}
              data-ocid="session.question_tab"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              Questions
              <span className="text-[10px] text-muted-foreground">
                ({questions.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setCommentTab("comments")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                commentTab === "comments"
                  ? "bg-card shadow-soft text-foreground"
                  : "text-muted-foreground"
              }`}
              data-ocid="session.comments_tab"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Comments
              <span className="text-[10px] text-muted-foreground">
                ({regularComments.length})
              </span>
            </button>
          </div>

          {/* Comment input */}
          {identity ? (
            <div className="flex gap-2 mb-4">
              <Input
                placeholder={
                  commentTab === "questions"
                    ? "Ask a question..."
                    : "Write a comment..."
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (commentText.trim()) {
                      addCommentMutation.mutate({
                        content: commentText.trim(),
                        parentId: null,
                      });
                    }
                  }
                }}
                className="rounded-xl flex-1"
                data-ocid="session.comment_input"
              />
              <Button
                onClick={() => {
                  if (commentText.trim()) {
                    addCommentMutation.mutate({
                      content: commentText.trim(),
                      parentId: null,
                    });
                  }
                }}
                disabled={addCommentMutation.isPending || !commentText.trim()}
                className="rounded-xl px-3"
                data-ocid="session.comment_submit_button"
              >
                {addCommentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-xs">Post</span>
                )}
              </Button>
            </div>
          ) : (
            <div className="mb-4 py-3 text-center text-sm text-muted-foreground rounded-xl bg-muted/40">
              Log in to ask questions or comment
            </div>
          )}

          {/* Comment list */}
          {commentsQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/20">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedComments.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground text-sm"
              data-ocid="session.comments.empty_state"
            >
              No {commentTab} yet. Be the first!
            </div>
          ) : (
            <div className="space-y-3">
              {displayedComments.map((comment, i) => {
                const replies = replyComments.filter(
                  (r) =>
                    r.parentCommentId?.toString() === comment.id.toString(),
                );
                const upvoteCount = comment.upvotes.length;

                return (
                  <div
                    key={comment.id.toString()}
                    className="rounded-xl bg-muted/20 border border-border/60 p-3"
                    data-ocid={`session.comment.item.${i + 1}`}
                  >
                    {comment.isModerated ? (
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground italic">
                          🤖 AI Moderation: This comment was flagged
                          {comment.moderationReason
                            ? ` — ${comment.moderationReason}`
                            : ""}
                        </p>
                      </div>
                    ) : (
                      <div>
                        {/* Author row */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[9px] font-bold flex-shrink-0">
                              {getInitials(comment.authorId)}
                            </div>
                            <span className="text-xs font-medium text-foreground">
                              {shortenPrincipal(comment.authorId)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatRelativeTime(comment.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => upvoteMutation.mutate(comment.id)}
                              disabled={!identity || upvoteMutation.isPending}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all text-xs"
                              data-ocid={`session.upvote_button.${i + 1}`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="font-medium">{upvoteCount}</span>
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <p className="text-sm text-foreground leading-relaxed mb-2">
                          {comment.content}
                        </p>

                        {/* Reply button */}
                        {identity && (
                          <button
                            type="button"
                            onClick={() =>
                              setReplyingTo(
                                replyingTo?.toString() === comment.id.toString()
                                  ? null
                                  : comment.id,
                              )
                            }
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Reply className="w-3 h-3" />
                            Reply
                            {replies.length > 0 && (
                              <span className="ml-1">({replies.length})</span>
                            )}
                          </button>
                        )}

                        {/* Reply input */}
                        {replyingTo?.toString() === comment.id.toString() && (
                          <div className="flex gap-2 mt-2 pl-4 border-l-2 border-primary/20">
                            <Input
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="rounded-xl text-xs h-8"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                if (replyText.trim()) {
                                  addCommentMutation.mutate({
                                    content: replyText.trim(),
                                    parentId: comment.id,
                                  });
                                }
                              }}
                              disabled={
                                addCommentMutation.isPending ||
                                !replyText.trim()
                              }
                              className="h-8 px-2 rounded-xl text-xs"
                            >
                              Post
                            </Button>
                          </div>
                        )}

                        {/* Replies */}
                        {replies.length > 0 && (
                          <div className="mt-2 pl-4 border-l-2 border-border/60 space-y-2">
                            {replies.map((reply) => (
                              <div
                                key={reply.id.toString()}
                                className="flex gap-2"
                              >
                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-[9px] font-bold flex-shrink-0">
                                  {getInitials(reply.authorId)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[11px] font-medium text-foreground">
                                      {shortenPrincipal(reply.authorId)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatRelativeTime(reply.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-foreground">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leader moderation panel */}
        {isLeader && (
          <div className="rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setModerationPanelOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Moderation Panel
                <span className="text-xs text-muted-foreground">
                  ({comments.length} comments)
                </span>
              </div>
              {moderationPanelOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {moderationPanelOpen && (
              <div className="divide-y divide-border max-h-64 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">
                    No comments yet.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id.toString()}
                      className="px-4 py-3 flex items-start justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {shortenPrincipal(comment.authorId)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {comment.isModerated
                            ? `[Moderated: ${comment.moderationReason}]`
                            : comment.content}
                        </p>
                      </div>
                      {!comment.isModerated && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setModerationTarget(comment.id);
                            setModerationDialogOpen(true);
                          }}
                          className="h-7 px-2 text-xs rounded-lg text-amber-600 border-amber-200 hover:bg-amber-50 flex-shrink-0"
                        >
                          Moderate
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Moderation dialog */}
      <Dialog
        open={moderationDialogOpen}
        onOpenChange={setModerationDialogOpen}
      >
        <DialogContent
          className="sm:max-w-sm rounded-2xl"
          data-ocid="session.moderate_dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Moderate Comment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              This comment will be hidden and flagged for AI review.
            </p>
            <Textarea
              placeholder="Reason for moderation (e.g. Abusive language, Spam)"
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
              className="rounded-xl text-sm resize-none"
              rows={3}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setModerationDialogOpen(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (moderationTarget && moderationReason.trim()) {
                  moderateMutation.mutate({
                    commentId: moderationTarget,
                    reason: moderationReason.trim(),
                  });
                }
              }}
              disabled={moderateMutation.isPending || !moderationReason.trim()}
              className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
            >
              {moderateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Moderate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function VideoPlaceholder({ leaderName }: { leaderName: string }) {
  return (
    <div className="aspect-video bg-gradient-to-br from-primary via-primary to-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-24 h-24 rounded-full border border-white/30" />
        <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full border border-white/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-white/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-3 text-white">
        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
          <Radio className="w-8 h-8 text-red-400 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="font-bold text-base">Live Stream by {leaderName}</p>
          <p className="text-xs text-white/60 mt-1">
            Video integration requires streaming service setup
          </p>
        </div>
        {/* Fake player controls */}
        <div className="flex items-center gap-4 mt-2">
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <Play className="w-4 h-4 text-white ml-0.5" />
          </button>
          <div className="w-24 h-1 rounded-full bg-white/20">
            <div className="w-1/3 h-full rounded-full bg-white/60" />
          </div>
          <span className="text-xs text-white/60">LIVE</span>
        </div>
      </div>

      {/* LIVE badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        LIVE
      </div>
    </div>
  );
}

function ScheduledPlaceholder({ scheduledTime }: { scheduledTime: bigint }) {
  return (
    <div className="aspect-video bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/10 border border-amber-200/60 rounded-2xl flex flex-col items-center justify-center gap-3">
      <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300/60 flex items-center justify-center">
        <Clock className="w-7 h-7 text-amber-500" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-amber-700 dark:text-amber-300">
          Session starts on
        </p>
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
          {formatScheduledTime(scheduledTime)}
        </p>
        <p className="text-xs text-amber-500 mt-1">
          {getCountdown(scheduledTime)}
        </p>
      </div>
    </div>
  );
}

function EndedPlaceholder() {
  return (
    <div className="aspect-video bg-gradient-to-br from-muted/60 to-muted/30 border border-border rounded-2xl flex flex-col items-center justify-center gap-3">
      <div className="w-14 h-14 rounded-full bg-muted border-2 border-border flex items-center justify-center">
        <CheckCircle className="w-7 h-7 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-foreground">This session has ended</p>
        <p className="text-xs text-muted-foreground mt-1">
          This recording is archived in Leader Archive
        </p>
      </div>
    </div>
  );
}
