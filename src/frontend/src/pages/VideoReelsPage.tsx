import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, User } from "lucide-react";
import { useState } from "react";

interface VideoReel {
  id: number;
  videoUrl: string;
  thumbnail: string;
  author: string;
  authorAvatar?: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

// Mock data for demonstration
const mockReels: VideoReel[] = [
  {
    id: 1,
    videoUrl: "",
    thumbnail: "/assets/generated/civworld-splash.dim_2732x2732.png",
    author: "Civic Leader",
    caption: "Join the movement for better governance! 🗳️ #CivicEngagement",
    likes: 1234,
    comments: 89,
    shares: 45,
    isLiked: false,
  },
  {
    id: 2,
    videoUrl: "",
    thumbnail: "/assets/generated/civworld-splash.dim_2732x2732.png",
    author: "Policy Maker",
    caption: "Understanding your rights as a citizen 📚 #KnowYourRights",
    likes: 2341,
    comments: 156,
    shares: 78,
    isLiked: false,
  },
  {
    id: 3,
    videoUrl: "",
    thumbnail: "/assets/generated/civworld-splash.dim_2732x2732.png",
    author: "Community Voice",
    caption: "Local issues that matter to our community 🏘️ #LocalPolitics",
    likes: 987,
    comments: 67,
    shares: 34,
    isLiked: false,
  },
];

export default function VideoReelsPage() {
  const [reels, setReels] = useState<VideoReel[]>(mockReels);

  const handleLike = (reelId: number) => {
    setReels((prev) =>
      prev.map((reel) => {
        if (reel.id === reelId) {
          return {
            ...reel,
            isLiked: !reel.isLiked,
            likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1,
          };
        }
        return reel;
      }),
    );
  };

  const handleComment = (reelId: number) => {
    console.log("Comment on reel:", reelId);
  };

  const handleShare = (reelId: number) => {
    console.log("Share reel:", reelId);
  };

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black">
      {reels.map((reel) => (
        <div
          key={reel.id}
          className="relative h-screen w-full snap-start snap-always flex items-center justify-center"
        >
          {/* Video/Thumbnail Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-deep-blue/20 to-saffron/20">
            <img
              src={reel.thumbnail}
              alt="Video thumbnail"
              className="w-full h-full object-cover opacity-40"
            />
          </div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 pb-24">
            <div className="flex items-end justify-between">
              {/* Left Side: Author Info & Caption */}
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarImage src={reel.authorAvatar} />
                    <AvatarFallback className="bg-gradient-to-br from-deep-blue to-saffron text-white">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white font-semibold text-sm">
                    {reel.author}
                  </span>
                </div>
                <p className="text-white text-sm leading-relaxed line-clamp-3">
                  {reel.caption}
                </p>
              </div>

              {/* Right Side: Action Buttons */}
              <div className="flex flex-col items-center gap-6">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={() => handleLike(reel.id)}
                  className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                >
                  <div
                    className={`p-3 rounded-full backdrop-blur-md ${
                      reel.isLiked
                        ? "bg-gradient-to-br from-deep-blue to-saffron"
                        : "bg-white/20"
                    }`}
                  >
                    <Heart
                      className={`h-6 w-6 ${
                        reel.isLiked ? "text-white fill-white" : "text-white"
                      }`}
                    />
                  </div>
                  <span className="text-white text-xs font-medium">
                    {reel.likes}
                  </span>
                </button>

                {/* Comment Button */}
                <button
                  type="button"
                  onClick={() => handleComment(reel.id)}
                  className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                >
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-md">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-medium">
                    {reel.comments}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={() => handleShare(reel.id)}
                  className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                >
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-md">
                    <Share2 className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-medium">
                    {reel.shares}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Coming Soon Badge */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-gradient-to-br from-deep-blue to-saffron text-white px-6 py-3 rounded-full shadow-premium backdrop-blur-md">
              <p className="text-sm font-semibold">Video & Reels Coming Soon</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
