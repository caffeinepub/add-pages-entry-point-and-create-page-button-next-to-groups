import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetUserPosts } from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, MessageSquare, BarChart3, Camera } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import EditProfilePictureModal from '../components/EditProfilePictureModal';
import PostCard from '../components/PostCard';
import BadgeDisplay from '../components/BadgeDisplay';
import VerifiedBadge from '../components/VerifiedBadge';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: userPosts, isLoading: postsLoading } = useGetUserPosts(identity?.getPrincipal() || null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPhotoModalOpen, setEditPhotoModalOpen] = useState(false);

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  const userInitials = userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const profilePhotoUrl = userProfile.profilePhoto?.getDirectURL();

  return (
    <div className="min-h-full bg-background pb-20">
      {/* Profile Header */}
      <div className="bg-[oklch(0.45_0.12_250)] text-white pt-8 pb-24">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                {profilePhotoUrl ? (
                  <AvatarImage src={profilePhotoUrl} alt={userProfile.name} />
                ) : (
                  <AvatarFallback className="bg-white text-[oklch(0.45_0.12_250)] text-3xl font-bold">
                    {userInitials}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-white text-[oklch(0.45_0.12_250)] hover:bg-white/90 shadow-lg"
                onClick={() => setEditPhotoModalOpen(true)}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="container max-w-2xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-3xl font-bold text-foreground">{userProfile.name}</h2>
              {userProfile.verifiedStatus && <VerifiedBadge size="lg" />}
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

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setEditModalOpen(true)}
                className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white px-8 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Edit Profile
              </Button>
              <Button
                onClick={() => navigate({ to: '/messages' })}
                variant="outline"
                className="gap-2 px-6 border-[oklch(0.45_0.12_250)] text-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.45_0.12_250)] hover:text-white transition-all duration-200"
              >
                <MessageSquare className="h-4 w-4" />
                Messages
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs for Posts and Analytics */}
        <Tabs defaultValue="posts" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
            <TabsTrigger value="posts" className="data-[state=active]:bg-white data-[state=active]:text-foreground">
              My Posts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-foreground">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
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
                <p>No posts yet. Create your first post!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard variant="personal" />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-muted-foreground border-t">
          <p>
            © 2026. Built with love using{' '}
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

      <EditProfileModal open={editModalOpen} onOpenChange={setEditModalOpen} />
      <EditProfilePictureModal open={editPhotoModalOpen} onOpenChange={setEditPhotoModalOpen} />
    </div>
  );
}
