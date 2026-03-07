import { Video } from "lucide-react";

export default function VideoPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Video Feed</h2>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-[oklch(0.45_0.12_250)]/10 rounded-full p-8 mb-6">
            <Video className="h-16 w-16 text-[oklch(0.45_0.12_250)]" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Video Feed Coming Soon
          </h3>
          <p className="text-muted-foreground max-w-md">
            We're working on bringing you video content. Stay tuned for updates
            on civic discussions and political commentary.
          </p>
        </div>
      </div>
    </div>
  );
}
