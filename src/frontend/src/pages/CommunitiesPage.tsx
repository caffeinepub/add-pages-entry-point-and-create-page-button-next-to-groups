import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, FileText, Loader2, Plus, Users } from "lucide-react";
import React, { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetGroups, useGetPages } from "../hooks/useQueries";
import type { Group, Page } from "../types";

function GroupCard({ group, onClick }: { group: Group; onClick: () => void }) {
  const coverUrl = group.coverImage
    ? (group.coverImage as any).getDirectURL?.()
    : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-3 hover:bg-muted/50 transition-all text-left"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/20 flex-shrink-0 flex items-center justify-center">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Users className="w-6 h-6 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">
          {group.name}
        </p>
        {group.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {group.description}
          </p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
}

function PageCard({ page, onClick }: { page: Page; onClick: () => void }) {
  const imageUrl = page.profileImage
    ? (page.profileImage as any).getDirectURL?.()
    : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-3 hover:bg-muted/50 transition-all text-left"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/20 flex-shrink-0 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={page.pageName}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileText className="w-6 h-6 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">
          {page.pageName}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {page.category}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
}

export default function CommunitiesPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const { data: groups = [], isLoading: groupsLoading } = useGetGroups();
  const { data: pages = [], isLoading: pagesLoading } = useGetPages();

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">Communities</h1>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        <Tabs defaultValue="groups">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="groups" className="flex-1">
              Groups ({groups.length})
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex-1">
              Pages ({pages.length})
            </TabsTrigger>
          </TabsList>

          {/* Groups Tab */}
          <TabsContent value="groups">
            {groupsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">
                  No groups yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to create a group!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id.toString()}
                    group={group}
                    onClick={() =>
                      navigate({
                        to: "/groups/$groupId",
                        params: { groupId: group.id.toString() },
                      })
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages">
            {pagesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">
                  No pages yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a page to share your civic mission!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pages.map((page) => (
                  <PageCard
                    key={page.pageName}
                    page={page}
                    onClick={() => navigate({ to: "/communities" })}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* FAB */}
      {identity && (
        <div className="fixed bottom-24 right-4 z-50">
          {showCreateMenu && (
            <div className="absolute bottom-16 right-0 bg-card border border-border rounded-2xl shadow-xl overflow-hidden min-w-[180px]">
              <button
                type="button"
                onClick={() => {
                  setShowCreateMenu(false);
                  navigate({ to: "/create-group" });
                }}
                className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-muted transition-colors text-left"
              >
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Create Group
                  </p>
                </div>
              </button>
              <div className="h-px bg-border" />
              <button
                type="button"
                onClick={() => {
                  setShowCreateMenu(false);
                  navigate({ to: "/create-page" });
                }}
                className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-muted transition-colors text-left"
              >
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Create Page
                  </p>
                </div>
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
            aria-label="Create community"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Backdrop for FAB menu */}
      {showCreateMenu && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          className="fixed inset-0 z-40"
          onClick={() => setShowCreateMenu(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowCreateMenu(false);
          }}
        />
      )}
    </div>
  );
}
