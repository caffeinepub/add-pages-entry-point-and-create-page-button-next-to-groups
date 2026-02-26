import React, { useState } from 'react';
import { useGetCallerUserProfile, useGetPosts } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PostCard from '../components/PostCard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import EditProfileModal from '../components/EditProfileModal';
import EditProfilePictureModal from '../components/EditProfilePictureModal';
import { Camera, Settings, Loader2, User } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: allPosts = [], isLoading: postsLoading } = useGetPosts();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditPicture, setShowEditPicture] = useState(false);

  const userPosts = allPosts.filter(
    (p) => identity && p.author.toString() === identity.getPrincipal().toString()
  );

  const profilePhotoUrl = userProfile?.profilePhoto
    ? userProfile.profilePhoto.getDirectURL()
    : null;

  if (profileLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Profile Header */}
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
            </div>
            <button
              onClick={() => setShowEditPicture(true)}
              className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => setShowEditProfile(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-all"
          >
            <Settings className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground">
            {userProfile?.name || 'Anonymous'}
          </h2>
          {userProfile?.bio && (
            <p className="text-sm text-muted-foreground mt-1">{userProfile.bio}</p>
          )}
          {userProfile?.location && (
            <p className="text-xs text-muted-foreground mt-1">📍 {userProfile.location}</p>
          )}
        </div>

        {/* Stats */}
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
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {Number(userProfile?.civicTokenBalance ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">CVT</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-4 max-w-lg mx-auto">
        <Tabs defaultValue="posts">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="posts">
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
          </TabsContent>
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>

      <EditProfileModal open={showEditProfile} onOpenChange={setShowEditProfile} />
      <EditProfilePictureModal open={showEditPicture} onOpenChange={setShowEditPicture} />
    </div>
  );
}
