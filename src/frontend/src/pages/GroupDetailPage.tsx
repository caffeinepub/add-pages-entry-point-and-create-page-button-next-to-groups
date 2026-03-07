import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  Plus,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import CreateGroupPostModal from "../components/CreateGroupPostModal";
import PostCard from "../components/PostCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetGroup,
  useGetGroupMembers,
  useGetGroupPosts,
  useIsUserInGroup,
  useJoinGroup,
  useLeaveGroup,
} from "../hooks/useQueries";
import type { Post } from "../types";
import { getBackendErrorMessage } from "../utils/backendErrors";

export default function GroupDetailPage() {
  const { groupId } = useParams({ from: "/groups/$groupId" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const groupIdNum = Number(groupId);

  const { data: group, isLoading: groupLoading } = useGetGroup(groupIdNum);
  const { data: members = [] } = useGetGroupMembers(groupIdNum);
  const { data: posts = [], isLoading: postsLoading } =
    useGetGroupPosts(groupIdNum);
  const { data: isMember = false } = useIsUserInGroup(groupIdNum);

  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  const handleJoin = async () => {
    try {
      await joinGroup.mutateAsync(groupIdNum);
      toast.success("Joined group!");
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  const handleLeave = async () => {
    try {
      await leaveGroup.mutateAsync(groupIdNum);
      toast.success("Left group");
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  if (groupLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Group not found</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/communities" })}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
        >
          Back to Communities
        </button>
      </div>
    );
  }

  const coverUrl = group.coverImage
    ? (group.coverImage as any).getDirectURL?.()
    : null;
  const isCreator =
    identity && group.creator.toString() === identity.getPrincipal().toString();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/communities" })}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground flex-1 truncate">
          {group.name}
        </h1>
      </div>

      {/* Cover Image */}
      {coverUrl && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={coverUrl}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Group Info */}
      <div className="px-4 py-4">
        <div className="bg-card border border-border rounded-2xl p-4 mb-4">
          <h2 className="text-xl font-bold text-foreground">{group.name}</h2>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {group.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{members.length} members</span>
            </div>
          </div>

          {identity && !isCreator && (
            <div className="mt-3">
              {isMember ? (
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={leaveGroup.isPending}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-all disabled:opacity-50"
                >
                  {leaveGroup.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserMinus className="w-4 h-4" />
                  )}
                  Leave Group
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={joinGroup.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {joinGroup.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Join Group
                </button>
              )}
            </div>
          )}
        </div>

        {/* Posts */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Posts</h3>
          {isMember && (
            <button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Post
            </button>
          )}
        </div>

        {postsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No posts yet in this group
          </div>
        ) : (
          (posts as Post[])
            .filter(Boolean)
            .map((post) => <PostCard key={post.id.toString()} post={post} />)
        )}
      </div>

      <CreateGroupPostModal
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        groupId={groupIdNum}
      />
    </div>
  );
}
