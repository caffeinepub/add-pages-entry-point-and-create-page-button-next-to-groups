import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type {
  UserProfile,
  Post,
  Poll,
  Comment,
  Group,
  Page,
  LocalIssue,
  Message,
  TrendingHashtag,
  Report,
  ReportReason,
  ReportTargetType,
} from '../types';

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

function formatBackendError(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  const msg = String(error);
  if (msg.includes('suspended')) return 'Your account has been suspended.';
  if (msg.includes('not found')) return 'The requested item was not found.';
  if (msg.includes('unauthorized') || msg.includes('not authorized'))
    return 'You are not authorized to perform this action.';
  if (msg.includes('already voted')) return 'You have already voted on this poll.';
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Network error. Please check your connection.';
  if (msg.includes('timeout')) return 'Request timed out. Please try again.';
  return msg.length > 100 ? 'An error occurred. Please try again.' : msg;
}

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await (actor as any).getCallerUserProfile();
      return result ?? null;
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
      if (!actor) throw new Error('Actor not available');
      await (actor as any).saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

// Alias used by EditProfileModal, EditProfilePictureModal, ProfileSetupModal
export const useSaveUserProfile = useSaveCallerUserProfile;

export function useGetUserProfile(principal: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const result = await (actor as any).getUserProfile(principal);
      return result ?? null;
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export function useGetPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getPosts();
      return result ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

// Aliases
export const useGetAllPosts = useGetPosts;
export const useGetNewsFeedPosts = useGetPosts;

export function useGetGroupPosts(groupId: number | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['groupPosts', groupId],
    queryFn: async () => {
      if (!actor || groupId === undefined) return [];
      const result = await (actor as any).getGroupPosts(groupId);
      return result ?? [];
    },
    enabled: !!actor && !isFetching && groupId !== undefined,
  });
}

export function useGetUserPosts(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['userPosts', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      const allPosts: Post[] = await (actor as any).getPosts();
      return (allPosts ?? []).filter((p) => p.author.toString() === userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      content: { text: string | null; image: any; video: any };
      postType?: { regular: null } | { newsFeed: null };
      groupId?: number | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const groupIdArg =
        params.groupId !== undefined && params.groupId !== null ? [params.groupId] : [];
      await (actor as any).createPost(
        params.content,
        params.postType ?? { regular: null },
        groupIdArg
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['groupPosts'] });
      toast.success('Post created successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useUpdatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      postId: bigint | number;
      content: { text: string | null; image: any; video: any };
    }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).editPost(Number(params.postId), params.content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['groupPosts'] });
      toast.success('Post updated successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useEditPost() {
  return useUpdatePost();
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint | number) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).deletePost(Number(postId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['groupPosts'] });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint | number) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).likePost(Number(postId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint | number) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).unlikePost(Number(postId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useHasLikedPost(postId: bigint | number | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasLiked', postId !== undefined ? Number(postId) : undefined],
    queryFn: async () => {
      if (!actor || postId === undefined) return false;
      const result = await (actor as any).hasLikedPost(Number(postId));
      return result ?? false;
    },
    enabled: !!actor && !isFetching && postId !== undefined,
  });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function useGetComments(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getComments(postId);
      return result ?? [];
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

// Alias
export const useGetCommentsByPost = useGetComments;

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      postId: string;
      content: string;
      parentCommentId?: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const parentId =
        params.parentCommentId !== undefined ? [params.parentCommentId] : [];
      await (actor as any).addComment(params.postId, params.content, parentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useEditComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      commentId: number;
      content?: string;
      newContent?: string;
      postId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const text = params.content ?? params.newContent ?? '';
      await (actor as any).editComment(params.commentId, text);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      toast.success('Comment updated');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { commentId: number; postId: string }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).deleteComment(params.commentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      toast.success('Comment deleted');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useLikeComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { commentId: number; postId: string }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).likeComment(params.commentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useUnlikeComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { commentId: number; postId: string }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).unlikeComment(params.commentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Polls ───────────────────────────────────────────────────────────────────

export function useGetPolls() {
  const { actor, isFetching } = useActor();

  return useQuery<Poll[]>({
    queryKey: ['polls'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getPolls();
      return result ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePoll() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      question: string;
      options: string[];
      isPublic: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).createPoll(params.question, params.options, params.isPublic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast.success('Poll created successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useVoteOnPoll() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { pollId: number; optionIndex: number }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).voteOnPoll(params.pollId, params.optionIndex);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['pollResults', variables.pollId] });
      queryClient.invalidateQueries({ queryKey: ['hasVoted', variables.pollId] });
      toast.success('Vote submitted successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

// Alias for backward compat
export const useVotePoll = useVoteOnPoll;

export function useGetPollResults(pollId: number) {
  const { actor, isFetching } = useActor();

  return useQuery<{ votes: bigint[]; totalResponses: number; userVote: any } | null>({
    queryKey: ['pollResults', pollId],
    queryFn: async () => {
      if (!actor) return null;
      const result = await (actor as any).getPollResults(pollId);
      return result ?? null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHasVotedOnPoll(pollId: bigint | number | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasVoted', pollId !== undefined ? Number(pollId) : undefined],
    queryFn: async () => {
      if (!actor || pollId === undefined) return false;
      const result = await (actor as any).hasVotedOnPoll(Number(pollId));
      return result ?? false;
    },
    enabled: !!actor && !isFetching && pollId !== undefined,
  });
}

// ─── Groups ──────────────────────────────────────────────────────────────────

export function useGetGroups() {
  const { actor, isFetching } = useActor();

  return useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getGroups();
      return result ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias
export const useGetAllGroups = useGetGroups;

export function useGetGroup(groupId: bigint | number | undefined) {
  const { actor, isFetching } = useActor();
  const numId = groupId !== undefined ? Number(groupId) : undefined;

  return useQuery<Group | null>({
    queryKey: ['group', numId],
    queryFn: async () => {
      if (!actor || numId === undefined) return null;
      const result = await (actor as any).getGroup(numId);
      return result ?? null;
    },
    enabled: !!actor && !isFetching && numId !== undefined,
  });
}

// Alias
export const useGetGroupById = useGetGroup;

export function useCreateGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      coverImage?: any;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).createGroup(
        params.name,
        params.description,
        params.coverImage ? [params.coverImage] : []
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useJoinGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: bigint | number) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).joinGroup(Number(groupId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
      queryClient.invalidateQueries({ queryKey: ['groupMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['isUserInGroup'] });
      toast.success('Joined group successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useLeaveGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: bigint | number) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).leaveGroup(Number(groupId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
      queryClient.invalidateQueries({ queryKey: ['groupMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['isUserInGroup'] });
      toast.success('Left group successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useDeleteGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: bigint | number) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).deleteGroup(Number(groupId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useGetGroupMembers(groupId: bigint | number | undefined) {
  const { actor, isFetching } = useActor();
  const numId = groupId !== undefined ? Number(groupId) : undefined;

  return useQuery<any[]>({
    queryKey: ['groupMemberships', numId],
    queryFn: async () => {
      if (!actor || numId === undefined) return [];
      const result = await (actor as any).getGroupMembers(numId);
      return result ?? [];
    },
    enabled: !!actor && !isFetching && numId !== undefined,
  });
}

export function useIsUserInGroup(
  groupId: bigint | number | undefined,
  userId: string | undefined
) {
  const { actor, isFetching } = useActor();
  const numId = groupId !== undefined ? Number(groupId) : undefined;

  return useQuery<boolean>({
    queryKey: ['isUserInGroup', numId, userId],
    queryFn: async () => {
      if (!actor || numId === undefined || !userId) return false;
      const members: any[] = await (actor as any).getGroupMembers(numId);
      return (members ?? []).some((m: any) => m.user?.toString() === userId);
    },
    enabled: !!actor && !isFetching && numId !== undefined && !!userId,
  });
}

// ─── Pages ───────────────────────────────────────────────────────────────────

export function useGetPages() {
  const { actor, isFetching } = useActor();

  return useQuery<Page[]>({
    queryKey: ['pages'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getPages();
      return result ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

// Aliases
export const useGetAllPages = useGetPages;

export function useGetPageById(pageId: number | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Page | null>({
    queryKey: ['page', pageId],
    queryFn: async () => {
      if (!actor || pageId === undefined) return null;
      const pages: Page[] = await (actor as any).getPages();
      return (pages ?? [])[pageId] ?? null;
    },
    enabled: !!actor && !isFetching && pageId !== undefined,
  });
}

export function useCreatePage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      pageName: string;
      category: string;
      description: string;
      profileImage?: any;
      isPrivate: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).createPage(
        params.pageName,
        params.category,
        params.description,
        params.profileImage ? [params.profileImage] : [],
        params.isPrivate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page created successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Local Issues ─────────────────────────────────────────────────────────────

export function useGetLocalIssues() {
  const { actor, isFetching } = useActor();

  return useQuery<LocalIssue[]>({
    queryKey: ['localIssues'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getLocalIssues();
      return result ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLocalIssue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      location?: string;
      constituency: string;
      image?: any;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).createLocalIssue(
        params.title,
        params.description,
        params.location ? [params.location] : [],
        params.constituency,
        params.image ? [params.image] : []
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['localIssues'] });
      toast.success('Issue reported successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function useGetMessages(otherPrincipal: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', otherPrincipal],
    queryFn: async () => {
      if (!actor || !otherPrincipal) return [];
      const result = await (actor as any).getMessages(otherPrincipal);
      return result ?? [];
    },
    enabled: !!actor && !isFetching && !!otherPrincipal,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { receiver: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).sendMessage(params.receiver, params.content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.receiver] });
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Trending Hashtags ────────────────────────────────────────────────────────

export function useGetTrendingHashtags() {
  const { actor, isFetching } = useActor();

  return useQuery<TrendingHashtag[]>({
    queryKey: ['trendingHashtags'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getTrendingHashtags();
      return result ?? [];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5 * 60 * 1000,
  });
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function useGetAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsResult | null>({
    queryKey: ['analytics'],
    queryFn: async () => {
      if (!actor) return null;
      const result = await (actor as any).getAnalytics();
      return result ?? null;
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export function useIsFollowing(_targetId: string | undefined) {
  // Stub — follow system not yet in backend
  return useQuery<boolean>({
    queryKey: ['isFollowing', _targetId],
    queryFn: async () => false,
    enabled: false,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).followUser(targetPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Following user');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).unfollowUser(targetPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Unfollowed user');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Verified Users ───────────────────────────────────────────────────────────

export function useIsUserVerified(principal: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isVerified', principal],
    queryFn: async () => {
      if (!actor || !principal) return false;
      const result = await (actor as any).isUserVerified(principal);
      return result ?? false;
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export function useGetCallerWallet() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['callerWallet'],
    queryFn: async () => {
      if (!actor) return null;
      const result = await (actor as any).getCallerWallet();
      return result ?? null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerPointHistory() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['callerPointHistory'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getCallerPointHistory();
      return result ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Discussions ──────────────────────────────────────────────────────────────

export function useCreateDiscussion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      context: string;
      region: string;
      category: any;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).createDiscussion(
        params.title,
        params.context,
        params.region,
        params.category
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast.success('Discussion created successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export function useSubmitReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      targetType: ReportTargetType;
      targetId: number;
      reason: ReportReason;
      details: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).submitReport(
        params.targetType,
        params.targetId,
        params.reason,
        params.details
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report submitted successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useGetReports() {
  const { actor, isFetching } = useActor();

  return useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getReports();
      return result ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      const result = await (actor as any).isCallerAdmin();
      return result ?? false;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSuspendUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).suspendUser(userPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['suspendedUsers'] });
      toast.success('User suspended successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useUnsuspendUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).unsuspendUser(userPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suspendedUsers'] });
      toast.success('User unsuspended successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}

export function useGetCallerSuspensionStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['callerSuspensionStatus'],
    queryFn: async () => {
      if (!actor) return false;
      const result = await (actor as any).isCallerSuspended();
      return result ?? false;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeleteReportedContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { type: 'post' | 'comment'; id: number }) => {
      if (!actor) throw new Error('Actor not available');
      if (params.type === 'post') {
        await (actor as any).deletePost(params.id);
      } else {
        await (actor as any).deleteComment(params.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Content deleted successfully');
    },
    onError: (error) => {
      toast.error(formatBackendError(error));
    },
  });
}
