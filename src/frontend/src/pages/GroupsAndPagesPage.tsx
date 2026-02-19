import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllGroups, useGetUserGroups } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Plus } from 'lucide-react';
import CreateGroupModal from '../components/CreateGroupModal';

export default function GroupsAndPagesPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: allGroups, isLoading: allGroupsLoading } = useGetAllGroups();
  const { data: userGroups, isLoading: userGroupsLoading } = useGetUserGroups(identity?.getPrincipal() || null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Groups & Pages</h2>

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => setShowCreateGroupModal(true)}
            className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] h-auto py-4 flex flex-col items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span className="font-semibold">Create Group</span>
          </Button>
          <Button
            onClick={() => navigate({ to: '/pages/create' })}
            className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] h-auto py-4 flex flex-col items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span className="font-semibold">Create Page</span>
          </Button>
        </div>

        {/* Tabs for Groups and Pages */}
        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="groups">
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="pages">
              <FileText className="h-4 w-4 mr-2" />
              Pages
            </TabsTrigger>
          </TabsList>

          {/* Groups Tab Content */}
          <TabsContent value="groups" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">My Groups</h3>
              {userGroupsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : userGroups && userGroups.length > 0 ? (
                <div className="space-y-3">
                  {userGroups.map((group) => (
                    <GroupCard key={group.id.toString()} group={group} onClick={() => navigate({ to: `/groups/${group.id.toString()}` })} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">You haven't joined any groups yet.</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">All Groups</h3>
              {allGroupsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : allGroups && allGroups.length > 0 ? (
                <div className="space-y-3">
                  {allGroups.map((group) => (
                    <GroupCard key={group.id.toString()} group={group} onClick={() => navigate({ to: `/groups/${group.id.toString()}` })} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No groups yet. Create the first one!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Pages Tab Content */}
          <TabsContent value="pages" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">My Pages</h3>
              <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm mb-4">Pages feature coming soon!</p>
                <p className="text-xs">Create and manage your community pages here.</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Following</h3>
              <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">You're not following any pages yet.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateGroupModal 
        open={showCreateGroupModal} 
        onOpenChange={setShowCreateGroupModal} 
      />
    </div>
  );
}

function GroupCard({ group, onClick }: { group: any; onClick: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useState(() => {
    if (group.coverImage) {
      setImageUrl(group.coverImage.getDirectURL());
    }
  });

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      {imageUrl && (
        <div className="w-full h-32 overflow-hidden">
          <img src={imageUrl} alt={group.name} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="py-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-[oklch(0.45_0.12_250)]" />
          {group.name}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2">{group.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
