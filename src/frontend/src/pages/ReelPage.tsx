import { Film } from 'lucide-react';

export default function ReelPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-gradient-to-br from-[oklch(0.45_0.12_250)] to-[oklch(0.35_0.10_250)] rounded-full p-8 mb-6">
          <Film className="h-16 w-16 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Reels Coming Soon
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mb-2">
          Get ready for short-form video content that brings civic engagement to life.
        </p>
        <p className="text-muted-foreground max-w-md">
          Share your political views, community stories, and civic moments in engaging vertical videos.
        </p>
      </div>
    </div>
  );
}
