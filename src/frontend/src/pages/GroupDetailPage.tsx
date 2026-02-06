import { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetGroupById, useGetGroupMembers, useGetGroupPosts, useJoinGroup, useIsUserInGroup } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, UserCheck } from 'lucide-react';
import PostCard from '../components/PostCard';
import CreateGroupPostModal from '../components/CreateGroupPostModal';

export default function GroupDetailPage() {
  const { groupId } = useParams({ from: '/groups/$groupId' });
  const { identity } = useInternetIdentity();
  const groupIdBigInt = BigInt(groupId);
  
  const { data: group, isLoading: groupLoading } = useGetGroupById(groupIdBigInt);
  const { data: members, isLoading: membersLoading } = useGetGroupMembers(groupIdBigInt);
  const { data: posts, isLoading: postsLoading } = useGetGroupPosts(groupIdBigInt);
  const { data: isMember } = useIsUserInGroup(groupIdBigInt, identity?.getPrincipal() || null);
  const joinGroup = useJoinGroup();
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);

  useEffect(() => {
    if (group?.coverImage) {
      setImageUrl(group.coverImage.getDirectURL());
    }
  }, [group]);

  const handleJoinGroup = () => {
    joinGroup.mutate(groupIdBigInt);
  };

  if (groupLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Group not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <Card className="mb-6">
          {imageUrl && (
            <div className="w-full h-64 overflow-hidden rounded-t-lg">
              <img src={imageUrl} alt={group.name} className="w-full h-full object-cover" />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{group.name}</CardTitle>
                <CardDescription className="text-base">{group.description}</CardDescription>
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{members?.length || 0} members</span>
                </div>
              </div>
              <Button
                onClick={handleJoinGroup}
                disabled={isMember || joinGroup.isPending}
                className={isMember ? 'bg-green-600 hover:bg-green-700' : 'bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]'}
              >
                {isMember ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Joined
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {isMember && (
          <div className="mb-6">
            <Button
              onClick={() => setCreatePostModalOpen(true)}
              className="w-full bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]"
            >
              Create Post in Group
            </Button>
          </div>
        )}

        <h3 className="text-xl font-semibold mb-4">Group Posts</h3>
        
        {postsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id.toString()} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No posts in this group yet. Be the first to post!</p>
          </div>
        )}
      </div>

      <CreateGroupPostModal 
        open={createPostModalOpen} 
        onOpenChange={setCreatePostModalOpen}
        groupId={groupIdBigInt}
      />
    </div>
  );
}
