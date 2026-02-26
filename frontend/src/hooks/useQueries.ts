import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Comment, ExternalBlob, MediaContent, UserProfile, Poll, Post } from '../backend';
import { getBackendErrorMessage } from '../utils/backendErrors';

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface TrendingHashtagItem {
  word: string;
  count: number;
}

export interface AnalyticsResult {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  followerCount: number;
  pollParticipations: number;
  topPosts: Post[];
  topContributors: UserProfile[];
  trendingHashtags: TrendingHashtagItem[];
}

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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

export function useGetUserProfile(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      const { Principal } = await import('@dfinity/principal');
      return actor.getUserProfile(Principal.fromText(userId));
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Alias used by ProfileSetupModal, EditProfileModal, EditProfilePictureModal
export const useSaveUserProfile = useSaveCallerUserProfile;

// ─── Posts ───────────────────────────────────────────────────────────────────

export function useGetPosts() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      const posts = await actor.getPosts();
      return [...posts].sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !actorFetching,
  });
}

// Aliases used by various pages
export const useGetAllPosts = useGetPosts;
export const useGetNewsFeedPosts = useGetPosts;

export function useGetUserPosts(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['userPosts', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      const allPosts = await actor.getPosts();
      const { Principal } = await import('@dfinity/principal');
      let principal: import('@dfinity/principal').Principal;
      try {
        principal = Principal.fromText(userId);
      } catch {
        return [];
      }
      return allPosts.filter((p) => p.author.toString() === principal.toString());
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetPost(postId: bigint | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['post', postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === undefined) return null;
      return actor.getPost(postId);
    },
    enabled: !!actor && !actorFetching && postId !== undefined,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      content,
      groupId,
    }: {
      content: MediaContent;
      groupId: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(content, groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: unknown) => {
      console.error('Create post error:', getBackendErrorMessage(error));
    },
  });
}

export function useCreateNewsFeedPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: MediaContent) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createNewsFeedPost(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
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
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have updatePost; delete and recreate as workaround
      await actor.deletePost(postId);
      return actor.createPost(content, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likePost(postId);
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['hasLiked', postId.toString()] });
    },
    onError: (error: unknown) => {
      console.error('Like post error:', getBackendErrorMessage(error));
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlikePost(postId);
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['hasLiked', postId.toString()] });
    },
    onError: (error: unknown) => {
      console.error('Unlike post error:', getBackendErrorMessage(error));
    },
  });
}

export function useHasLikedPost(postId: bigint | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['hasLiked', postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === undefined) return false;
      return actor.hasLikedPost(postId);
    },
    enabled: !!actor && !actorFetching && postId !== undefined,
  });
}

// ─── Polls ───────────────────────────────────────────────────────────────────

export function useGetPolls() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['polls'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPolls();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPoll(pollId: bigint | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['poll', pollId?.toString()],
    queryFn: async () => {
      if (!actor || pollId === undefined) return null;
      return actor.getPoll(pollId);
    },
    enabled: !!actor && !actorFetching && pollId !== undefined,
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
      if (!actor) throw new Error('Actor not available');
      return actor.createPoll(question, options, isPublic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
    onError: (error: unknown) => {
      console.error('Create poll error:', getBackendErrorMessage(error));
    },
  });
}

export function useVotePoll() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pollId,
      optionIndex,
    }: {
      pollId: bigint;
      optionIndex: bigint;
    }): Promise<Poll> => {
      if (!actor) throw new Error('Actor not available');
      return actor.votePoll(pollId, optionIndex);
    },
    onSuccess: (_data, { pollId }) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['poll', pollId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['hasVoted', pollId.toString()] });
    },
    onError: (error: unknown) => {
      console.error('Vote poll error:', getBackendErrorMessage(error));
    },
  });
}

export function useHasVotedOnPoll(pollId: bigint | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['hasVoted', pollId?.toString()],
    queryFn: async () => {
      if (!actor || pollId === undefined) return false;
      return actor.hasVotedOnPoll(pollId);
    },
    enabled: !!actor && !actorFetching && pollId !== undefined,
  });
}

// ─── Groups ──────────────────────────────────────────────────────────────────

export function useGetGroups() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGroups();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Aliases
export const useGetAllGroups = useGetGroups;

export function useGetUserGroups(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['userGroups', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      const allGroups = await actor.getGroups();
      const membershipChecks = await Promise.all(
        allGroups.map(async (g) => {
          const members = await actor.getGroupMembers(g.id);
          const { Principal } = await import('@dfinity/principal');
          let principal: import('@dfinity/principal').Principal;
          try {
            principal = Principal.fromText(userId);
          } catch {
            return false;
          }
          return members.some((m) => m.user.toString() === principal.toString());
        })
      );
      return allGroups.filter((_, i) => membershipChecks[i]);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetGroup(groupId: bigint | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['group', groupId?.toString()],
    queryFn: async () => {
      if (!actor || groupId === undefined) return null;
      return actor.getGroup(groupId);
    },
    enabled: !!actor && !actorFetching && groupId !== undefined,
  });
}

// Alias
export const useGetGroupById = useGetGroup;

export function useGetGroupPosts(groupId: bigint | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['groupPosts', groupId?.toString()],
    queryFn: async () => {
      if (!actor || groupId === undefined) return [];
      const allPosts = await actor.getPosts();
      return allPosts.filter(
        (p) => p.groupId !== undefined && p.groupId !== null && p.groupId === groupId
      );
    },
    enabled: !!actor && !actorFetching && groupId !== undefined,
  });
}

export function useIsUserInGroup(groupId: bigint | undefined, userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['isUserInGroup', groupId?.toString(), userId],
    queryFn: async () => {
      if (!actor || groupId === undefined || !userId) return false;
      const members = await actor.getGroupMembers(groupId);
      const { Principal } = await import('@dfinity/principal');
      let principal: import('@dfinity/principal').Principal;
      try {
        principal = Principal.fromText(userId);
      } catch {
        return false;
      }
      return members.some((m) => m.user.toString() === principal.toString());
    },
    enabled: !!actor && !actorFetching && groupId !== undefined && !!userId,
  });
}

export function useCreateGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      coverImage,
    }: {
      name: string;
      description: string;
      coverImage: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGroup(name, description, coverImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: unknown) => {
      console.error('Create group error:', getBackendErrorMessage(error));
    },
  });
}

export function useJoinGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.joinGroup(groupId);
    },
    onSuccess: (_data, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['isUserInGroup', groupId.toString()] });
    },
  });
}

export function useLeaveGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.leaveGroup(groupId);
    },
    onSuccess: (_data, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['isUserInGroup', groupId.toString()] });
    },
  });
}

export function useDeleteGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteGroup(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useGetGroupMembers(groupId: bigint | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['groupMembers', groupId?.toString()],
    queryFn: async () => {
      if (!actor || groupId === undefined) return [];
      return actor.getGroupMembers(groupId);
    },
    enabled: !!actor && !actorFetching && groupId !== undefined,
  });
}

// ─── Pages ───────────────────────────────────────────────────────────────────

export function useGetAllPages() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPages();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPageById(pageId: number | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['page', pageId],
    queryFn: async () => {
      if (!actor || pageId === undefined) return null;
      const pages = await actor.getAllPages();
      return pages[pageId] ?? null;
    },
    enabled: !!actor && !actorFetching && pageId !== undefined,
  });
}

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
      if (!actor) throw new Error('Actor not available');
      return actor.createPage(pageName, category, description, profileImage, isPrivate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
    onError: (error: unknown) => {
      console.error('Create page error:', getBackendErrorMessage(error));
    },
  });
}

// ─── Follow (stubs - not in backend) ─────────────────────────────────────────

export function useIsFollowing(_targetId: string | undefined) {
  return useQuery({
    queryKey: ['isFollowing', _targetId],
    queryFn: async () => false,
    enabled: false,
  });
}

export function useFollowUser() {
  return useMutation({
    mutationFn: async (_userId: string) => {
      throw new Error('Follow functionality not yet available');
    },
  });
}

export function useUnfollowUser() {
  return useMutation({
    mutationFn: async (_userId: string) => {
      throw new Error('Unfollow functionality not yet available');
    },
  });
}

// ─── Verified Users (stub - not in backend query) ────────────────────────────

export function useIsUserVerified(_userId: string | undefined) {
  return useQuery({
    queryKey: ['isVerified', _userId],
    queryFn: async () => false,
    enabled: false,
  });
}

// ─── Messages (stub - messaging not yet in backend) ──────────────────────────

export function useGetMessages(userId: string | undefined) {
  return useQuery({
    queryKey: ['messages', userId],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async (_params: { receiverId: string; content: string }) => {
      throw new Error('Messaging not yet available');
    },
  });
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function useGetAnalytics() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<AnalyticsResult | null>({
    queryKey: ['analytics'],
    queryFn: async () => {
      if (!actor) return null;
      const posts = await actor.getPosts();
      const totalLikes = posts.reduce((sum, p) => sum + Number(p.likeCount), 0);
      return {
        totalPosts: posts.length,
        totalLikes,
        totalComments: 0,
        followerCount: 0,
        pollParticipations: 0,
        topPosts: posts.slice(0, 3),
        topContributors: [],
        trendingHashtags: [],
      };
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Trending Hashtags (derived from posts) ───────────────────────────────────

export function useGetTrendingHashtags() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<TrendingHashtagItem[]>({
    queryKey: ['trendingHashtags'],
    queryFn: async () => {
      if (!actor) return [];
      const posts = await actor.getPosts();
      const counts: Record<string, number> = {};
      for (const post of posts) {
        const text = post.content.text ?? '';
        const matches = text.match(/#[\w]+/g) ?? [];
        for (const tag of matches) {
          counts[tag] = (counts[tag] ?? 0) + 1;
        }
      }
      return Object.entries(counts)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes
  });
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export function useGetCallerWallet() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['callerWallet'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerWallet();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCallerPointHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['callerPointHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerPointHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Local Issues (stubs) ─────────────────────────────────────────────────────

export function useGetLocalIssues() {
  return useQuery({
    queryKey: ['localIssues'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateLocalIssue() {
  return useMutation({
    mutationFn: async (_issue: unknown) => {
      throw new Error('Local issues not yet available');
    },
  });
}

// ─── Reports (stub) ───────────────────────────────────────────────────────────

export function useSubmitReport() {
  return useMutation({
    mutationFn: async (_report: unknown) => {
      throw new Error('Report functionality not yet available');
    },
  });
}

// Alias
export const useCreateReport = useSubmitReport;

// ─── Discussions (stub) ───────────────────────────────────────────────────────

export function useCreateDiscussion() {
  return useMutation({
    mutationFn: async (_discussion: {
      title: string;
      context: string;
      region: string;
      category: string;
    }) => {
      throw new Error('Discussion creation not yet available');
    },
  });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function useGetCommentsByPost(postId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor || !postId) return [];
      return actor.getCommentsByPost(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
  });
}

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
      parentCommentId: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(postId, content, parentCommentId);
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error: unknown) => {
      console.error('Add comment error:', getBackendErrorMessage(error));
    },
  });
}

export function useEditComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
      newContent,
      postId,
    }: {
      commentId: bigint;
      newContent: string;
      postId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editComment(commentId, newContent);
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error: unknown) => {
      console.error('Edit comment error:', getBackendErrorMessage(error));
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
      postId,
    }: {
      commentId: bigint;
      postId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteComment(commentId);
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error: unknown) => {
      console.error('Delete comment error:', getBackendErrorMessage(error));
    },
  });
}

export function useLikeComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
      postId,
    }: {
      commentId: bigint;
      postId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likeComment(commentId);
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error: unknown) => {
      console.error('Like comment error:', getBackendErrorMessage(error));
    },
  });
}
