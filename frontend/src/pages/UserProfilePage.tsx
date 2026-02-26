import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import {
  useGetUserProfile,
  useGetPosts,
  useIsFollowing,
  useFollowUser,
  useUnfollowUser,
  useIsUserVerified,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PostCard from '../components/PostCard';
import ReportModal from '../components/ReportModal';
import { ArrowLeft, UserPlus, UserMinus, Flag, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfilePage() {
  const { userId } = useParams({ from: '/user/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [showReport, setShowReport] = useState(false);

  // Validate principal
  let userPrincipal: string | undefined;
  try {
    Principal.fromText(userId);
    userPrincipal = userId;
  } catch {
    userPrincipal = undefined;
  }

  const { data: userProfile, isLoading: profileLoading } = useGetUserProfile(userPrincipal);
  const { data: allPosts = [], isLoading: postsLoading } = useGetPosts();
  const { data: isFollowing = false } = useIsFollowing(userPrincipal);
  const { data: isVerified = false } = useIsUserVerified(userPrincipal);

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const userPosts = allPosts.filter(
    (p) => userPrincipal && p.author.toString() === userPrincipal
  );

  const isOwnProfile =
    identity && userPrincipal && identity.getPrincipal().toString() === userPrincipal;

  const handleFollow = async () => {
    if (!userPrincipal) return;
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(userPrincipal);
        toast.success('Unfollowed');
      } else {
        await followUser.mutateAsync(userPrincipal);
        toast.success('Following!');
      }
    } catch {
      toast.info('Follow feature coming soon!');
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userPrincipal) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-muted-foreground">Invalid user ID</p>
        <button
          onClick={() => navigate({ to: '/' })}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
        >
          Go Home
        </button>
      </div>
    );
  }

  const profilePhotoUrl = userProfile?.profilePhoto
    ? userProfile.profilePhoto.getDirectURL()
    : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/' })}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground flex-1 truncate">
          {userProfile?.name || 'User Profile'}
        </h1>
        {!isOwnProfile && (
          <button
            onClick={() => setShowReport(true)}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <Flag className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-primary" />
            )}
          </div>
          {!isOwnProfile && identity && (
            <button
              onClick={handleFollow}
              disabled={followUser.isPending || unfollowUser.isPending}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                isFollowing
                  ? 'border border-border hover:bg-muted'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {followUser.isPending || unfollowUser.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFollowing ? (
                <><UserMinus className="w-4 h-4" /> Unfollow</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Follow</>
              )}
            </button>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">
              {userProfile?.name || 'Anonymous'}
            </h2>
            {isVerified && (
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                ✓ Verified
              </span>
            )}
          </div>
          {userProfile?.bio && (
            <p className="text-sm text-muted-foreground mt-1">{userProfile.bio}</p>
          )}
          {userProfile?.location && (
            <p className="text-xs text-muted-foreground mt-1">📍 {userProfile.location}</p>
          )}
        </div>

        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{userPosts.length}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {Number(userProfile?.followerCount ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="px-4 py-4 max-w-lg mx-auto">
        <h3 className="font-semibold text-foreground mb-3">Posts</h3>
        {postsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No posts yet
          </div>
        ) : (
          userPosts.map((post) => (
            <PostCard key={post.id.toString()} post={post} />
          ))
        )}
      </div>

      {/* Report Modal — uses isOpen/onClose props */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        targetType="profile"
        targetId={BigInt(0)}
      />
    </div>
  );
}
