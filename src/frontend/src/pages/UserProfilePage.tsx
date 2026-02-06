import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserProfile, useGetUserPosts, useIsFollowing, useFollowUser, useUnfollowUser, useIsUserVerified } from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Users, MessageSquare, Loader2, Flag } from 'lucide-react';
import PostCard from '../components/PostCard';
import BadgeDisplay from '../components/BadgeDisplay';
import VerifiedBadge from '../components/VerifiedBadge';
import ReportModal from '../components/ReportModal';

export default function UserProfilePage() {
  const { userId } = useParams({ from: '/profile/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [showReportModal, setShowReportModal] = useState(false);

  let userPrincipal: Principal | null = null;
  try {
    userPrincipal = Principal.fromText(userId);
  } catch (error) {
    console.error('Invalid principal ID:', error);
  }

  const { data: userProfile, isLoading: profileLoading } = useGetUserProfile(userPrincipal);
  const { data: userPosts, isLoading: postsLoading } = useGetUserPosts(userPrincipal);
  const { data: isFollowing, isLoading: followStatusLoading } = useIsFollowing(userPrincipal);
  const { data: isVerified } = useIsUserVerified(userPrincipal);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const currentUserPrincipal = identity?.getPrincipal();
  const isOwnProfile = currentUserPrincipal?.toString() === userId;
  const isAuthenticated = !!identity;

  if (!userPrincipal) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg">Invalid user ID</p>
          <Button onClick={() => navigate({ to: '/' })} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">User profile not found</p>
          <Button onClick={() => navigate({ to: '/' })} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const userInitials = userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleFollowToggle = async () => {
    if (!userPrincipal) return;
    
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(userPrincipal);
      } else {
        await followUser.mutateAsync(userPrincipal);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleMessage = () => {
    navigate({ to: '/messages' });
  };

  const isFollowActionPending = followUser.isPending || unfollowUser.isPending;

  // Convert Principal to bigint for report modal (using 0 for profile reports as per backend spec)
  const profileReportId = 0n;

  return (
    <>
      <div className="min-h-full bg-background pb-20">
        {/* Profile Header */}
        <div className="bg-[oklch(0.45_0.12_250)] text-white pt-8 pb-24">
          <div className="container max-w-2xl mx-auto px-4">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src="/assets/generated/default-profile.dim_200x200.png" />
                <AvatarFallback className="bg-white text-[oklch(0.45_0.12_250)] text-3xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="container max-w-2xl mx-auto px-4 -mt-16">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-3xl font-bold text-foreground">{userProfile.name}</h2>
                {isVerified && <VerifiedBadge size="lg" />}
              </div>
              {userProfile.bio && (
                <p className="text-muted-foreground mb-4">{userProfile.bio}</p>
              )}

              {/* Badges Display */}
              {userProfile.badges && userProfile.badges.length > 0 && (
                <div className="flex justify-center mb-4">
                  <BadgeDisplay badges={userProfile.badges} size="lg" />
                </div>
              )}
              
              <div className="flex items-center justify-center gap-6 mb-6 text-sm text-muted-foreground">
                {userProfile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{userProfile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold text-foreground">
                    {Number(userProfile.followerCount).toLocaleString()}
                  </span>
                  <span>Followers</span>
                </div>
              </div>

              {/* Action Buttons - Show for other users' profiles when authenticated */}
              {isAuthenticated && !isOwnProfile && (
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button
                    onClick={handleFollowToggle}
                    disabled={isFollowActionPending || followStatusLoading}
                    className={`
                      px-8 py-2 font-semibold transition-all duration-200 ease-in-out
                      ${
                        isFollowing
                          ? 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                          : 'bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white shadow-md hover:shadow-lg'
                      }
                      ${isFollowActionPending || followStatusLoading ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                  >
                    {isFollowActionPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {followStatusLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    onClick={handleMessage}
                    variant="outline"
                    className="gap-2 px-6 border-[oklch(0.45_0.12_250)] text-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.45_0.12_250)] hover:text-white transition-all duration-200"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                  <Button
                    onClick={() => setShowReportModal(true)}
                    variant="outline"
                    className="gap-2 px-6 border-[oklch(0.50_0.12_25)] text-[oklch(0.50_0.12_25)] hover:bg-[oklch(0.50_0.12_25)] hover:text-white transition-all duration-200"
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </Button>
                </div>
              )}

              {/* Show login prompt for non-authenticated users */}
              {!isAuthenticated && !isOwnProfile && (
                <div className="text-sm text-muted-foreground mt-2">
                  Please log in to follow this user or send messages.
                </div>
              )}

              {/* Own profile message */}
              {isOwnProfile && (
                <div className="text-sm text-muted-foreground mt-2">
                  This is your profile. Go to{' '}
                  <button
                    onClick={() => navigate({ to: '/profile' })}
                    className="text-[oklch(0.45_0.12_250)] hover:underline font-medium"
                  >
                    your profile page
                  </button>
                  {' '}to edit.
                </div>
              )}
            </div>
          </div>

          {/* Posts Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Posts</h3>
            {postsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : userPosts && userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post) => <PostCard key={post.id.toString()} post={post} />)}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-white rounded-lg border border-border">
                <p>No posts yet.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="text-center py-8 text-sm text-muted-foreground border-t">
            <p>
              © 2025. Built with love using{' '}
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[oklch(0.45_0.12_250)] hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="profile"
        targetId={profileReportId}
      />
    </>
  );
}
