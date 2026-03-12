import type { LiveReactionType } from "../backend.d";

export function formatRelativeTime(timestamp: bigint): string {
  const nowMs = Date.now();
  const tsMs = Number(timestamp) / 1_000_000;
  const diffMs = nowMs - tsMs;

  if (diffMs < 0) return "just now";
  if (diffMs < 60_000) return `${Math.floor(diffMs / 1000)}s ago`;
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
  return `${Math.floor(diffMs / 86_400_000)}d ago`;
}

export function formatScheduledTime(scheduledTime: bigint): string {
  const date = new Date(Number(scheduledTime) / 1_000_000);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getCountdown(scheduledTime: bigint): string {
  const nowMs = Date.now();
  const tsMs = Number(scheduledTime) / 1_000_000;
  const diffMs = tsMs - nowMs;

  if (diffMs <= 0) return "Starting soon";

  const days = Math.floor(diffMs / 86_400_000);
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function shortenPrincipal(principal: { toString(): string }): string {
  const text = principal.toString();
  if (text.length <= 12) return text;
  return `${text.slice(0, 8)}...`;
}

export function getReactionEmoji(type: LiveReactionType): string {
  switch (type) {
    case "fire":
      return "🔥";
    case "heart":
      return "❤️";
    case "clap":
      return "👏";
    case "wave":
      return "👋";
    default:
      return "👍";
  }
}

export function getInitials(principal: { toString(): string }): string {
  const text = principal.toString();
  return text.slice(0, 2).toUpperCase();
}
