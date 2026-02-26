import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetGroups } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Users, Plus, Loader2, ChevronRight } from 'lucide-react';
import { Group } from '../backend';

export default function GroupsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: groups = [], isLoading } = useGetGroups();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Groups</h1>
        {identity && (
          <button
            onClick={() => navigate({ to: '/create-group' })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        )}
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No groups yet</p>
            {identity && (
              <button
                onClick={() => navigate({ to: '/create-group' })}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
              >
                Create First Group
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group: Group) => (
              <button
                key={group.id.toString()}
                onClick={() => navigate({ to: '/groups/$groupId', params: { groupId: group.id.toString() } })}
                className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-3 hover:bg-muted/50 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  {group.coverImage ? (
                    <img
                      src={group.coverImage.getDirectURL()}
                      alt={group.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Users className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{group.name}</p>
                  {group.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {group.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
