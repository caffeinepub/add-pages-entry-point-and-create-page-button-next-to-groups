import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  Archive,
  CalendarClock,
  Clock,
  MapPin,
  Radio,
  Users,
} from "lucide-react";
import React from "react";
import type { LiveSession } from "../backend.d";
import { LiveSessionStatus } from "../backend.d";
import {
  formatScheduledTime,
  getCountdown,
  shortenPrincipal,
} from "../utils/liveUtils";

interface LiveSessionCardProps {
  session: LiveSession;
  onJoin?: () => void;
  isLeader?: boolean;
  index?: number;
}

export default function LiveSessionCard({
  session,
  onJoin,
  isLeader = false,
  index = 1,
}: LiveSessionCardProps) {
  const navigate = useNavigate();

  function handleAction() {
    if (onJoin) {
      onJoin();
    } else {
      navigate({ to: `/live/${session.id.toString()}` });
    }
  }

  const status = session.status as unknown as string;

  return (
    <Card className="rounded-xl border border-border shadow-soft hover:shadow-premium transition-all duration-200 bg-card overflow-hidden">
      {status === LiveSessionStatus.live && (
        <div className="h-1 bg-gradient-to-r from-red-500 to-rose-400" />
      )}
      {status === LiveSessionStatus.scheduled && (
        <div className="h-1 bg-gradient-to-r from-amber-400 to-yellow-300" />
      )}
      {status === LiveSessionStatus.ended && (
        <div className="h-1 bg-gradient-to-r from-muted to-muted-foreground/30" />
      )}

      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 mb-1">
              {session.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {session.topic}
            </p>
          </div>

          <div className="flex-shrink-0">
            {status === LiveSessionStatus.live && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            )}
            {status === LiveSessionStatus.scheduled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold">
                <CalendarClock className="w-3 h-3" />
                Scheduled
              </span>
            )}
            {status === LiveSessionStatus.ended && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                <Archive className="w-3 h-3" />
                Ended
              </span>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge
            variant="secondary"
            className="text-[10px] px-2 py-0.5 rounded-full"
          >
            <MapPin className="w-2.5 h-2.5 mr-1" />
            {session.constituency}
          </Badge>

          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Radio className="w-2.5 h-2.5" />
            {shortenPrincipal(session.leader)}
            {isLeader && (
              <span className="text-primary font-medium ml-1">(You)</span>
            )}
          </span>
        </div>

        {/* Time info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === LiveSessionStatus.live && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Users className="w-3 h-3" />
                {session.viewerCount.toString()} watching
              </span>
            )}
            {status === LiveSessionStatus.scheduled && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600">
                <Clock className="w-3 h-3" />
                {getCountdown(session.scheduledTime)}
              </span>
            )}
            {status === LiveSessionStatus.ended && (
              <span className="text-[11px] text-muted-foreground">
                {formatScheduledTime(session.scheduledTime)}
              </span>
            )}
          </div>

          {status === LiveSessionStatus.live && (
            <Button
              size="sm"
              onClick={handleAction}
              className="h-7 px-3 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg"
              data-ocid={`live_session_card.join_button.${index}`}
            >
              Join Live
            </Button>
          )}
          {status === LiveSessionStatus.scheduled && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAction}
              className="h-7 px-3 text-xs rounded-lg"
              data-ocid={`live_session_card.join_button.${index}`}
            >
              View Details
            </Button>
          )}
          {status === LiveSessionStatus.ended && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAction}
              className="h-7 px-3 text-xs rounded-lg"
              data-ocid={`live_session_card.join_button.${index}`}
            >
              Watch Recording
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
