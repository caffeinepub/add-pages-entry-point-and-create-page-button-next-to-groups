import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllGroups, useGetUserGroups } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, FileText } from 'lucide-react';
import CreateGroupModal from '../components/CreateGroupModal';

export default function GroupsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: allGroups, isLoading: allGroupsLoading } = useGetAllGroups();
  const { data: userGroups, isLoading: userGroupsLoading } = useGetUserGroups(identity?.getPrincipal() || null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold text-foreground">Groups</h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] gap-2 flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
            <Button
              onClick={() => navigate({ to: '/pages/create' })}
              variant="outline"
              className="gap-2 flex-1 sm:flex-none border-[oklch(0.45_0.12_250)] text-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.45_0.12_250)] hover:text-white"
            >
              <FileText className="h-4 w-4" />
              Create Page
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="all">All Groups</TabsTrigger>
            <TabsTrigger value="my-groups">My Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allGroupsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : allGroups && allGroups.length > 0 ? (
              allGroups.map((group) => (
                <GroupCard key={group.id.toString()} group={group} onClick={() => navigate({ to: `/groups/${group.id.toString()}` })} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No groups yet. Create the first one!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-groups" className="space-y-4">
            {userGroupsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : userGroups && userGroups.length > 0 ? (
              userGroups.map((group) => (
                <GroupCard key={group.id.toString()} group={group} onClick={() => navigate({ to: `/groups/${group.id.toString()}` })} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>You haven't joined any groups yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateGroupModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
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
        <div className="w-full h-48 overflow-hidden">
          <img src={imageUrl} alt={group.name} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[oklch(0.45_0.12_250)]" />
          {group.name}
        </CardTitle>
        <CardDescription>{group.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
