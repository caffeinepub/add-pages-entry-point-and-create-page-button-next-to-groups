import { getBuildId } from "@/utils/buildId";
import { Code } from "lucide-react";

export default function BuildInfoIndicator() {
  const buildId = getBuildId();

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
      <Code className="h-3 w-3" />
      <span>Build: {buildId}</span>
    </div>
  );
}
