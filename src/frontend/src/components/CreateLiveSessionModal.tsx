import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CalendarClock, Loader2, Radio } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import { formatBackendError } from "../utils/backendErrors";

interface Props {
  trigger: React.ReactNode;
  defaultGoLive?: boolean;
}

export default function CreateLiveSessionModal({
  trigger,
  defaultGoLive = false,
}: Props) {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [constituency, setConstituency] = useState(userProfile?.location ?? "");
  const [goLiveNow, setGoLiveNow] = useState(defaultGoLive);
  const [scheduleDateTime, setScheduleDateTime] = useState(() => {
    const d = new Date(Date.now() + 5 * 60_000);
    return d.toISOString().slice(0, 16);
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isVerifiedLeader = userProfile?.verifiedStatus === true;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (!identity) throw new Error("Please log in to create a session.");

      const scheduledMs = goLiveNow
        ? Date.now()
        : new Date(scheduleDateTime).getTime();
      const scheduledNs = BigInt(scheduledMs) * 1_000_000n;

      const sessionId = await actor.createLiveSession(
        title,
        topic,
        constituency,
        scheduledNs,
      );

      if (goLiveNow) {
        await actor.startLiveSession(sessionId);
      }

      return sessionId;
    },
    onSuccess: (sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["liveSessions"] });
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["scheduledSessions"] });
      toast.success(
        goLiveNow ? "You're live! 🔴" : "Session scheduled successfully!",
      );
      setOpen(false);
      resetForm();
      navigate({ to: `/live/${sessionId.toString()}` });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });

  function resetForm() {
    setTitle("");
    setTopic("");
    setConstituency(userProfile?.location ?? "");
    setGoLiveNow(defaultGoLive);
    setErrors({});
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Session title is required";
    if (!topic.trim()) newErrors.topic = "Topic is required";
    if (!constituency.trim())
      newErrors.constituency = "Constituency is required";
    if (!goLiveNow && !scheduleDateTime)
      newErrors.schedule = "Schedule date/time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    createMutation.mutate();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Radio className="w-5 h-5 text-red-500" />
            {goLiveNow ? "Go Live" : "Schedule Session"}
          </DialogTitle>
        </DialogHeader>

        {!identity ? (
          <div className="py-6 text-center text-muted-foreground">
            Please log in to create a live session.
          </div>
        ) : !isVerifiedLeader ? (
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <p className="text-sm text-muted-foreground">
              Only verified leaders can host live sessions.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                {goLiveNow ? (
                  <Radio className="w-4 h-4 text-red-500" />
                ) : (
                  <CalendarClock className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-sm font-medium">
                  {goLiveNow ? "Go Live Now" : "Schedule for Later"}
                </span>
              </div>
              <Switch
                checked={goLiveNow}
                onCheckedChange={setGoLiveNow}
                data-ocid="create_session.mode_switch"
              />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="session-title" className="text-sm font-medium">
                Session Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="session-title"
                placeholder="e.g. Town Hall: Water Supply Issues"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl"
                data-ocid="create_session.title_input"
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Topic */}
            <div className="space-y-1.5">
              <Label htmlFor="session-topic" className="text-sm font-medium">
                Topic <span className="text-red-500">*</span>
              </Label>
              <Input
                id="session-topic"
                placeholder="e.g. Infrastructure, Healthcare, Agriculture"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="rounded-xl"
                data-ocid="create_session.topic_input"
              />
              {errors.topic && (
                <p className="text-xs text-red-500">{errors.topic}</p>
              )}
            </div>

            {/* Constituency */}
            <div className="space-y-1.5">
              <Label
                htmlFor="session-constituency"
                className="text-sm font-medium"
              >
                Constituency <span className="text-red-500">*</span>
              </Label>
              <Input
                id="session-constituency"
                placeholder="e.g. Guntur Constituency"
                value={constituency}
                onChange={(e) => setConstituency(e.target.value)}
                className="rounded-xl"
                data-ocid="create_session.constituency_input"
              />
              {errors.constituency && (
                <p className="text-xs text-red-500">{errors.constituency}</p>
              )}
            </div>

            {/* Schedule datetime */}
            {!goLiveNow && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="session-schedule"
                  className="text-sm font-medium"
                >
                  Schedule Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="session-schedule"
                  type="datetime-local"
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="rounded-xl"
                  data-ocid="create_session.schedule_input"
                />
                {errors.schedule && (
                  <p className="text-xs text-red-500">{errors.schedule}</p>
                )}
              </div>
            )}
          </div>
        )}

        {identity && isVerifiedLeader && (
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl"
              data-ocid="create_session.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className={`flex-1 rounded-xl ${goLiveNow ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
              data-ocid="create_session.submit_button"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {goLiveNow ? "Going Live..." : "Scheduling..."}
                </>
              ) : goLiveNow ? (
                <>
                  <Radio className="w-4 h-4 mr-2" />
                  Go Live Now
                </>
              ) : (
                <>
                  <CalendarClock className="w-4 h-4 mr-2" />
                  Schedule Session
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
