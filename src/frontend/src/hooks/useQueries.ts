import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateGroupArgs,
  ExternalBlob,
  MediaContent,
  PostType,
  UserProfile,
} from "../backend";
import type { Post, TrendingHashtag } from "../types";
import { formatBackendError } from "../utils/backendErrors";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export type TrendingHashtagItem = TrendingHashtag;

export type AnalyticsResult = {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  followerCount: number;
  pollParticipations: number;
  topPosts: Post[];
  topContributors: UserProfile[];
  trendingHashtags: TrendingHashtag[];
};

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

// Alias used by EditProfileModal, EditProfilePictureModal, ProfileSetupModal
export const useSaveUserProfile = useSaveCallerUserProfile;

export function useGetUserProfile(principal: string | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      if (typeof (actor as any).getUserProfileByPrincipal === "function") {
        return (actor as any).getUserProfileByPrincipal(principal);
      }
      try {
        const { Principal } = await import("@dfinity/principal");
        return actor.getUserProfile(Principal.fromText(principal));
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export function useGetPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      if (typeof (actor as any).getAllPosts === "function") {
        const result = await (actor as any).getAllPosts();
        return (result ?? []).filter(Boolean) as Post[];
      }
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

// Aliases
export const useGetAllPosts = useGetPosts;
export const useGetNewsFeedPosts = useGetPosts;

export function useGetPost(postId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["post", postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return null;
      return actor.getPost(postId);
    },
    enabled: !!actor && !actorFetching && postId !== null,
  });
}

export function useGetUserPosts(userId: string | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ["userPosts", userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      if (typeof (actor as any).getUserPosts === "function") {
        const result = await (actor as any).getUserPosts(userId);
        return (result ?? []).filter(Boolean) as Post[];
      }
      if (typeof (actor as any).getAllPosts === "function") {
        const all = await (actor as any).getAllPosts();
        return ((all ?? []) as Post[])
          .filter(Boolean)
          .filter((p: Post) => p.author.toString() === userId);
      }
      return [];
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetGroupPosts(groupId: number | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ["groupPosts", groupId],
    queryFn: async () => {
      if (!actor || groupId === null) return [];
      if (typeof (actor as any).getGroupPosts !== "function") return [];
      const result = await (actor as any).getGroupPosts(BigInt(groupId));
      return (result ?? []).filter(Boolean) as Post[];
    },
    enabled: !!actor && !actorFetching && groupId !== null,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      groupId,
      postType,
    }: {
      content: MediaContent;
      groupId: bigint | null;
      postType: PostType;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      return actor.createPost(content, groupId, postType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] });
      toast.success("Post created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useUpdatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: bigint;
      content: MediaContent;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).editPost !== "function") {
        throw new Error("Edit post is not available.");
      }
      return (actor as any).editPost(postId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
      toast.success("Post updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export const useEditPost = useUpdatePost;

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).deletePost !== "function") {
        throw new Error("Delete post is not available.");
      }
      return (actor as any).deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
      toast.success("Post deleted.");
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).likePost !== "function") {
        throw new Error("Like post is not available.");
      }
      return (actor as any).likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).unlikePost !== "function") {
        throw new Error("Unlike post is not available.");
      }
      return (actor as any).unlikePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Polls ───────────────────────────────────────────────────────────────────

export function useGetPolls() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["polls"],
    queryFn: async () => {
      if (!actor) return [];
      if (typeof (actor as any).getAllPolls === "function") {
        return (actor as any).getAllPolls();
      }
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPoll(pollId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["poll", pollId?.toString()],
    queryFn: async () => {
      if (!actor || pollId === null) return null;
      return actor.getPoll(pollId);
    },
    enabled: !!actor && !actorFetching && pollId !== null,
  });
}

export function useGetPollResults(pollId: number | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    votes: bigint[];
    totalResponses: number;
    userVote: any;
  } | null>({
    queryKey: ["pollResults", pollId],
    queryFn: async () => {
      if (!actor || pollId === null) return null;
      if (typeof (actor as any).getPollResults !== "function") return null;
      const result = await (actor as any).getPollResults(BigInt(pollId));
      return result ?? null;
    },
    enabled: !!actor && !actorFetching && pollId !== null,
  });
}

export function useHasVotedOnPoll(pollId: bigint | number | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: [
      "hasVoted",
      pollId !== null && pollId !== undefined ? Number(pollId) : undefined,
    ],
    queryFn: async () => {
      if (!actor || pollId === null || pollId === undefined) return false;
      if (typeof (actor as any).hasVotedOnPoll !== "function") return false;
      const result = await (actor as any).hasVotedOnPoll(BigInt(pollId));
      return result ?? false;
    },
    enabled:
      !!actor &&
      !actorFetching &&
      pollId !== null &&
      pollId !== undefined &&
      !!identity,
  });
}

export function useCreatePoll() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      question,
      options,
      isPublic,
    }: {
      question: string;
      options: string[];
      isPublic: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      return actor.createPoll(question, options, isPublic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast.success("Poll created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useVoteOnPoll() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pollId,
      optionIndex,
    }: {
      pollId: bigint;
      optionIndex: number;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).voteOnPoll !== "function") {
        throw new Error("Vote on poll is not available.");
      }
      return (actor as any).voteOnPoll(pollId, BigInt(optionIndex));
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      queryClient.invalidateQueries({
        queryKey: ["poll", variables.pollId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["pollResults", Number(variables.pollId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["hasVoted", Number(variables.pollId)],
      });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

// Alias for backward compat
export const useVotePoll = useVoteOnPoll;

// ─── Groups ──────────────────────────────────────────────────────────────────

export function useGetGroups() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      if (!actor) return [];
      if (typeof (actor as any).getAllGroups === "function") {
        return (actor as any).getAllGroups();
      }
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias
export const useGetAllGroups = useGetGroups;

export function useGetGroup(groupId: bigint | number | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const id = groupId !== null && groupId !== undefined ? BigInt(groupId) : null;

  return useQuery({
    queryKey: ["group", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getGroup(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

// Alias
export const useGetGroupById = useGetGroup;

export function useGetGroupMembers(groupId: number | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      if (!actor || groupId === null || groupId === undefined) return [];
      if (typeof (actor as any).getGroupMembers !== "function") return [];
      try {
        const result = await (actor as any).getGroupMembers(BigInt(groupId));
        return result ?? [];
      } catch {
        return [];
      }
    },
    enabled:
      !!actor && !actorFetching && groupId !== null && groupId !== undefined,
  });
}

export function useIsUserInGroup(groupId: number | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ["isUserInGroup", groupId],
    queryFn: async () => {
      if (!actor || groupId === null || groupId === undefined || !identity)
        return false;
      if (typeof (actor as any).isUserInGroup !== "function") return false;
      try {
        const result = await (actor as any).isUserInGroup(BigInt(groupId));
        return result ?? false;
      } catch {
        return false;
      }
    },
    enabled:
      !!actor &&
      !actorFetching &&
      groupId !== null &&
      groupId !== undefined &&
      !!identity,
  });
}

export function useCreateGroup() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      coverImage,
    }: {
      name: string;
      description: string;
      coverImage?: ExternalBlob;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (!identity) throw new Error("Please log in to create a group.");

      const creator = identity.getPrincipal();
      const args: CreateGroupArgs = {
        name,
        description,
        coverImage: coverImage ?? undefined,
        adminIds: [creator],
        createdAt: BigInt(Date.now()) * 1_000_000n,
        creator,
      };
      return actor.createGroup(args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Group created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useJoinGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: bigint | number) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).joinGroup !== "function") {
        throw new Error("Join group is not available.");
      }
      return (actor as any).joinGroup(BigInt(groupId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers"] });
      queryClient.invalidateQueries({ queryKey: ["isUserInGroup"] });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useLeaveGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: bigint | number) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).leaveGroup !== "function") {
        throw new Error("Leave group is not available.");
      }
      return (actor as any).leaveGroup(BigInt(groupId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers"] });
      queryClient.invalidateQueries({ queryKey: ["isUserInGroup"] });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Pages ───────────────────────────────────────────────────────────────────

export function useGetPages() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      if (!actor) return [];
      if (typeof (actor as any).getAllPages === "function") {
        return (actor as any).getAllPages();
      }
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPage(pageId: bigint | number | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const id = pageId !== null && pageId !== undefined ? BigInt(pageId) : null;

  return useQuery({
    queryKey: ["page", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getPage(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

// Alias
export const useGetPageById = useGetPage;

export function useCreatePage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pageName,
      category,
      description,
      profileImage,
      isPrivate,
    }: {
      pageName: string;
      category: string;
      description: string;
      profileImage: ExternalBlob | null;
      isPrivate: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      return actor.createPage(
        pageName,
        category,
        description,
        profileImage,
        isPrivate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Page created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function useGetComments(postId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!actor || !postId) return [];
      if (typeof (actor as any).getComments !== "function") return [];
      return (actor as any).getComments(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
  });
}

// Alias
export const useGetCommentsByPost = useGetComments;

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
      parentCommentId,
    }: {
      postId: string;
      content: string;
      parentCommentId?: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).addComment !== "function") {
        throw new Error("Add comment is not available.");
      }
      return (actor as any).addComment(
        postId,
        content,
        parentCommentId ?? null,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useEditComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      content,
      postId: _postId,
    }: {
      commentId: bigint;
      content: string;
      postId: string;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).editComment !== "function") {
        throw new Error("Edit comment is not available.");
      }
      return (actor as any).editComment(commentId, content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      postId: _postId,
    }: {
      commentId: bigint;
      postId: string;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).deleteComment !== "function") {
        throw new Error("Delete comment is not available.");
      }
      return (actor as any).deleteComment(commentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useLikeComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      postId: _postId,
    }: {
      commentId: bigint;
      postId: string;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).likeComment !== "function") {
        throw new Error("Like comment is not available.");
      }
      return (actor as any).likeComment(commentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useUnlikeComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      postId: _postId,
    }: {
      commentId: bigint;
      postId: string;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).unlikeComment !== "function") {
        throw new Error("Unlike comment is not available.");
      }
      return (actor as any).unlikeComment(commentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function useGetMessages(otherUser: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["messages", otherUser],
    queryFn: async () => {
      if (!actor || !otherUser) return [];
      if (typeof (actor as any).getMessages !== "function") return [];
      return (actor as any).getMessages(otherUser);
    },
    enabled: !!actor && !actorFetching && !!otherUser && !!identity,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      receiver,
      content,
    }: {
      receiver: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).sendMessage !== "function") {
        throw new Error("Send message is not available.");
      }
      return (actor as any).sendMessage(receiver, content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.receiver],
      });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function useGetAnalytics() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AnalyticsResult | null>({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor) return null;
      if (typeof (actor as any).getAnalytics !== "function") return null;
      return (actor as any).getAnalytics();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Trending Hashtags ───────────────────────────────────────────────────────

export function useGetTrendingHashtags() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["trendingHashtags"],
    queryFn: async () => {
      if (!actor) return [];
      if (typeof (actor as any).getTrendingHashtags !== "function") return [];
      return (actor as any).getTrendingHashtags();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5 * 60 * 1000,
  });
}

// ─── Local Issues ────────────────────────────────────────────────────────────

export function useGetLocalIssues() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["localIssues"],
    queryFn: async () => {
      if (!actor) return [];
      if (typeof (actor as any).getLocalIssues !== "function") return [];
      return (actor as any).getLocalIssues();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateLocalIssue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issue: {
      title: string;
      description: string;
      location?: string;
      image?: ExternalBlob;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).createLocalIssue !== "function") {
        throw new Error("Create local issue is not available.");
      }
      return (actor as any).createLocalIssue(
        issue.title,
        issue.description,
        issue.location ?? null,
        issue.image ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["localIssues"] });
      toast.success("Issue reported successfully!");
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export function useSubmitReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetId,
      reason,
      details,
    }: {
      targetId: number;
      reason: string;
      details: string;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).submitReport !== "function") {
        throw new Error("Submit report is not available.");
      }
      return (actor as any).submitReport(BigInt(targetId), reason, details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report submitted successfully.");
    },
    onError: (error: unknown) => {
      const msg = formatBackendError(error);
      if (!msg.toLowerCase().includes("already reported")) {
        toast.error(msg);
      }
      throw error;
    },
  });
}

export function useGetReports() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      if (!actor) return [];
      if (typeof (actor as any).getReports !== "function") return [];
      return (actor as any).getReports();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias used by Header and AdminPage
export const useIsAdmin = useIsCallerAdmin;

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useDeletePostAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).adminDeletePost !== "function") {
        throw new Error("Admin delete post is not available.");
      }
      return (actor as any).adminDeletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Post deleted by admin.");
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

// Alias used by AdminPage
export const useDeleteReportedContent = useDeletePostAdmin;

export function useSuspendUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).suspendUser !== "function") {
        throw new Error("Suspend user is not available.");
      }
      return (actor as any).suspendUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("User suspended.");
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).followUser !== "function") {
        throw new Error("Follow user is not available.");
      }
      return (actor as any).followUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["isFollowing"] });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).unfollowUser !== "function") {
        throw new Error("Unfollow user is not available.");
      }
      return (actor as any).unfollowUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["isFollowing"] });
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useIsFollowing(userId: string | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ["isFollowing", userId],
    queryFn: async () => {
      if (!actor || !userId) return false;
      if (typeof (actor as any).isFollowing !== "function") return false;
      try {
        return (actor as any).isFollowing(userId);
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!userId && !!identity,
  });
}

export function useIsUserVerified(userId: string | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isUserVerified", userId],
    queryFn: async () => {
      if (!actor || !userId) return false;
      if (typeof (actor as any).isUserVerified !== "function") return false;
      try {
        return (actor as any).isUserVerified(userId);
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export function useGetWallet() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      if (!actor) return null;
      if (typeof (actor as any).getWallet !== "function") return null;
      return (actor as any).getWallet();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// Alias used by WalletPointsPage
export const useGetCallerWallet = useGetWallet;

export function useGetPointHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["pointHistory"],
    queryFn: async () => {
      if (!actor) return [];
      if (typeof (actor as any).getPointHistory !== "function") return [];
      return (actor as any).getPointHistory();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// Alias used by WalletPointsPage
export const useGetCallerPointHistory = useGetPointHistory;

// ─── Education ────────────────────────────────────────────────────────────────

export function useGetLearningModules() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["learningModules"],
    queryFn: async () => {
      if (!actor) return [];
      if (typeof (actor as any).getLearningModules !== "function") return [];
      return (actor as any).getLearningModules();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetQuizQuestions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["quizQuestions"],
    queryFn: async () => {
      if (!actor) return [];
      if (typeof (actor as any).getQuizQuestions !== "function") return [];
      return (actor as any).getQuizQuestions();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useGetNotifications() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      if (typeof (actor as any).getNotifications !== "function") return [];
      return (actor as any).getNotifications();
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 30000,
  });
}

// ─── Discussions ──────────────────────────────────────────────────────────────

export function useGetDiscussions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["discussions"],
    queryFn: async () => {
      if (!actor) return [];
      if (typeof (actor as any).getDiscussions !== "function") return [];
      return (actor as any).getDiscussions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateDiscussion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (discussion: {
      title: string;
      context: string;
      region: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Actor not available. Please try again.");
      if (typeof (actor as any).createDiscussion !== "function") {
        throw new Error("Create discussion is not available.");
      }
      return (actor as any).createDiscussion(
        discussion.title,
        discussion.context,
        discussion.region,
        discussion.category,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      toast.success("Discussion created!");
    },
    onError: (error: unknown) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── formatBackendError re-export ─────────────────────────────────────────────
export { formatBackendError };
