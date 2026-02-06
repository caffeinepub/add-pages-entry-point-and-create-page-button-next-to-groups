import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Post, Comment, UserProfile, Message, Group, Notification, AnalyticsData, GroupMembership, LocalIssue, IssueStatus, Promise_, PoliticalDiscussion, DiscussionCategory, Poll, Report, ReportReason, ReportTargetType, ReportStatus, LearningModule, QuizQuestion, EducationCategory, DifficultyLevel, UserProgress } from '../types';
import { OpinionResponse } from '../types';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';
import { normalizeMediaContent } from '../utils/candidOption';
import { formatBackendError } from '../utils/backendErrors';
import { PostType, UserRole } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getCallerUserProfile();
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

export function useGetUserProfile(userId: Principal | null) {
  const { actor } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return (actor as any).getUserProfile(userId);
    },
    enabled: !!actor && !!userId,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      // Invalidate current user profile
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      
      // Invalidate user profile cache for the current user
      if (identity) {
        queryClient.invalidateQueries({ 
          queryKey: ['userProfile', identity.getPrincipal().toString()] 
        });
      }
      
      // Refetch to update UI immediately
      queryClient.refetchQueries({ queryKey: ['currentUserProfile'] });
      
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

// Post Queries
export function useGetAllPosts() {
  const { actor } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      const posts = await (actor as any).getAllPosts();
      return posts.sort((a: Post, b: Post) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor,
  });
}

export function useGetNewsFeedPosts() {
  const { actor } = useActor();

  return useQuery<Post[]>({
    queryKey: ['newsFeedPosts'],
    queryFn: async () => {
      if (!actor) return [];
      const posts = await (actor as any).getNewsFeedPosts();
      return posts.sort((a: Post, b: Post) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor,
  });
}

export function useGetUserPosts(userId: Principal | null) {
  const { actor } = useActor();

  return useQuery<Post[]>({
    queryKey: ['userPosts', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      const posts = await (actor as any).getUserPosts(userId);
      return posts.sort((a: Post, b: Post) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !!userId,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, groupId }: { content: any; groupId?: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Normalize content to ensure proper Candid serialization
      const normalizedContent = normalizeMediaContent(content);
      
      return (actor as any).createPost(normalizedContent, groupId || null);
    },
    onSuccess: () => {
      // Invalidate and refetch all post-related queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['groupPosts'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsData'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['posts'] });
      
      // Dispatch custom event for post creation
      window.dispatchEvent(new Event('postCreated'));
      
      // Show success message
      toast.success('Post created successfully!');
    },
    onError: (error: unknown) => {
      console.error('Create post error:', error);
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useCreateNewsFeedPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content }: { content: any }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Normalize content to ensure proper Candid serialization
      const normalizedContent = normalizeMediaContent(content);
      
      return (actor as any).createNewsFeedPost(normalizedContent);
    },
    onSuccess: () => {
      // Invalidate and refetch all post-related queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['newsFeedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsData'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['newsFeedPosts'] });
      
      // Show success message
      toast.success('News post created successfully!');
    },
    onError: (error: unknown) => {
      console.error('Create news post error:', error);
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useUpdatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: bigint; content: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updatePost(postId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['newsFeedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['groupPosts'] });
      toast.success('Post updated successfully');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deletePost(postId);
    },
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['newsFeedPosts'] });
      await queryClient.cancelQueries({ queryKey: ['userPosts'] });

      // Snapshot previous values
      const previousPosts = queryClient.getQueryData(['posts']);
      const previousNewsFeed = queryClient.getQueryData(['newsFeedPosts']);

      // Optimistically remove post from cache
      queryClient.setQueryData(['posts'], (old: Post[] | undefined) => {
        return old?.filter(post => post.id !== postId) || [];
      });
      
      queryClient.setQueryData(['newsFeedPosts'], (old: Post[] | undefined) => {
        return old?.filter(post => post.id !== postId) || [];
      });

      return { previousPosts, previousNewsFeed };
    },
    onSuccess: () => {
      toast.success('Post deleted successfully');
    },
    onError: (error: unknown, postId, context) => {
      // Restore previous state on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      if (context?.previousNewsFeed) {
        queryClient.setQueryData(['newsFeedPosts'], context.previousNewsFeed);
      }
      
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['newsFeedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['groupPosts'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsData'] });
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['newsFeedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['groupPosts'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsData'] });
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

// User Role Queries
export function useGetCallerUserRole() {
  const { actor } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return (actor as any).getCallerUserRole();
    },
    enabled: !!actor,
  });
}

export function useIsCallerAdmin() {
  const { actor } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as any).isCallerAdmin();
    },
    enabled: !!actor,
  });
}

// Comment Queries
export function useGetPostComments(postId: bigint) {
  const { actor } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getPostComments(postId);
    },
    enabled: !!actor,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addComment(postId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['analyticsData'] });
      toast.success('Comment added');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsData'] });
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

// Poll Queries
export function useGetAllPolls() {
  const { actor } = useActor();

  return useQuery<Poll[]>({
    queryKey: ['polls'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getPolls(true);
    },
    enabled: !!actor,
  });
}

export function useCreatePoll() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ question, options, isPublic = true }: { question: string; options: string[]; isPublic?: boolean }) => {
      if (!actor) throw new Error('Actor not available. Please ensure you are logged in.');
      return (actor as any).createPoll(question, options, isPublic);
    },
    onSuccess: () => {
      // Invalidate and refetch all poll-related queries
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['polls'] });
    },
    onError: (error: Error) => {
      console.error('Create poll error:', error);
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useVoteOnPoll() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pollId, selectedOption }: { pollId: bigint; selectedOption: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).voteOnPoll(pollId, selectedOption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsData'] });
      toast.success('Vote recorded');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

// Follow Queries
export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToFollow: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).followUser(userToFollow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsData'] });
      toast.success('User followed');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToUnfollow: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).unfollowUser(userToUnfollow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsData'] });
      toast.success('User unfollowed');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useIsFollowing(user: Principal | null) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isFollowing', identity?.getPrincipal()?.toString(), user?.toString()],
    queryFn: async () => {
      if (!actor || !identity || !user) return false;
      return (actor as any).isFollowing(user);
    },
    enabled: !!actor && !!identity && !!user,
  });
}

// Message Queries
export function useGetConversation(otherUser: Principal | null) {
  const { actor } = useActor();

  return useQuery<Message[]>({
    queryKey: ['conversation', otherUser?.toString()],
    queryFn: async () => {
      if (!actor || !otherUser) return [];
      return (actor as any).getConversation(otherUser);
    },
    enabled: !!actor && !!otherUser,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiver, content }: { receiver: Principal; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).sendMessage(receiver, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.receiver.toString()] });
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

// Group Queries
export function useGetAllGroups() {
  const { actor } = useActor();

  return useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllGroups();
    },
    enabled: !!actor,
  });
}

export function useGetUserGroups(userId: Principal | null) {
  const { actor } = useActor();

  return useQuery<Group[]>({
    queryKey: ['userGroups', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return (actor as any).getUserGroups(userId);
    },
    enabled: !!actor && !!userId,
  });
}

export function useGetGroupById(groupId: bigint | null) {
  const { actor } = useActor();

  return useQuery<Group | null>({
    queryKey: ['group', groupId?.toString()],
    queryFn: async () => {
      if (!actor || groupId === null) return null;
      return (actor as any).getGroupById(groupId);
    },
    enabled: !!actor && groupId !== null,
  });
}

export function useGetGroupMembers(groupId: bigint | null) {
  const { actor } = useActor();

  return useQuery<GroupMembership[]>({
    queryKey: ['groupMembers', groupId?.toString()],
    queryFn: async () => {
      if (!actor || groupId === null) return [];
      return (actor as any).getGroupMembers(groupId);
    },
    enabled: !!actor && groupId !== null,
  });
}

export function useCreateGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description, coverImage }: { name: string; description: string; coverImage: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createGroup(name, description, coverImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
      toast.success('Group created successfully');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useJoinGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).joinGroup(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] });
      queryClient.invalidateQueries({ queryKey: ['isUserInGroup'] });
      toast.success('Joined group successfully');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useIsUserInGroup(groupId: bigint | null, userId: Principal | null) {
  const { actor } = useActor();

  return useQuery<boolean>({
    queryKey: ['isUserInGroup', groupId?.toString(), userId?.toString()],
    queryFn: async () => {
      if (!actor || groupId === null || !userId) return false;
      return (actor as any).isUserInGroup(groupId, userId);
    },
    enabled: !!actor && groupId !== null && !!userId,
  });
}

export function useGetGroupPosts(groupId: bigint | null) {
  const { actor } = useActor();

  return useQuery<Post[]>({
    queryKey: ['groupPosts', groupId?.toString()],
    queryFn: async () => {
      if (!actor || groupId === null) return [];
      const posts = await (actor as any).getGroupPosts(groupId);
      return posts.sort((a: Post, b: Post) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && groupId !== null,
  });
}

// Notification Queries
export function useGetUserNotifications() {
  const { actor } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      const notifications = await (actor as any).getUserNotifications();
      return notifications.sort((a: Notification, b: Notification) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMarkNotificationsAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).markNotificationsAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Hashtag Queries
export function useGetTrendingHashtags() {
  const { actor } = useActor();

  return useQuery({
    queryKey: ['trendingHashtags'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getTrendingHashtags24h();
    },
    enabled: !!actor,
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

// Analytics Queries
export function useGetAnalyticsData() {
  const { actor } = useActor();

  return useQuery<AnalyticsData>({
    queryKey: ['analyticsData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getAnalyticsData(null);
    },
    enabled: !!actor,
  });
}

// Verification Queries
export function useIsUserVerified(userId: Principal | null) {
  const { actor } = useActor();

  return useQuery<boolean>({
    queryKey: ['isUserVerified', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return false;
      return (actor as any).isUserVerified(userId);
    },
    enabled: !!actor && !!userId,
  });
}

// Local Issues Queries
export function useGetIssuesByConstituency(constituency: string) {
  const { actor } = useActor();

  return useQuery<LocalIssue[]>({
    queryKey: ['issues', constituency],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getIssuesByConstituency(constituency);
    },
    enabled: !!actor && !!constituency,
  });
}

export function useSubmitLocalIssue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, image, location, constituency }: { 
      title: string; 
      description: string; 
      image: any; 
      location: string | null; 
      constituency: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitLocalIssue(title, description, image, location, constituency);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

// Promise Queries
export function useGetPromisesByStatus(status: IssueStatus) {
  const { actor } = useActor();

  return useQuery<Promise_[]>({
    queryKey: ['promises', status],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getPromisesByStatus(status);
    },
    enabled: !!actor,
  });
}

export function useUpdatePromiseStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ promiseId, newStatus }: { promiseId: bigint; newStatus: IssueStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updatePromiseStatus(promiseId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promises'] });
      toast.success('Promise status updated successfully');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

// Discussion Queries
export function useGetDiscussionsByCategory(category: DiscussionCategory) {
  const { actor } = useActor();

  return useQuery<PoliticalDiscussion[]>({
    queryKey: ['discussions', category],
    queryFn: async () => {
      if (!actor) return [];
      const discussions = await (actor as any).getDiscussionsByCategory(category);
      return discussions.sort((a: PoliticalDiscussion, b: PoliticalDiscussion) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor,
  });
}

export function useCreateDiscussion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, context, region, category }: { 
      title: string; 
      context: string; 
      region: string; 
      category: DiscussionCategory;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createDiscussion(title, context, region, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast.success('Discussion created successfully');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useRespondToDiscussion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ discussionId, opinion }: { 
      discussionId: bigint; 
      opinion: 'agree' | 'neutral' | 'disagree';
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Map string to OpinionResponse enum
      let opinionEnum: OpinionResponse;
      if (opinion === 'agree') {
        opinionEnum = OpinionResponse.agree;
      } else if (opinion === 'neutral') {
        opinionEnum = OpinionResponse.neutral;
      } else {
        opinionEnum = OpinionResponse.disagree;
      }
      
      return (actor as any).respondToDiscussion(discussionId, opinionEnum);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast.success('Response recorded');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

// Report Queries
export function useSubmitReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetType, targetId, reason, details }: {
      targetType: ReportTargetType;
      targetId: bigint;
      reason: ReportReason;
      details: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).reportContent(targetType, targetId, reason, details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Content reported successfully. Thank you for helping maintain our community standards.');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useGetAllReports() {
  const { actor } = useActor();

  return useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      if (!actor) return [];
      const reports = await (actor as any).getAllReports();
      return reports.sort((a: Report, b: Report) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor,
  });
}

export function useGetReportsByStatus(status: ReportStatus) {
  const { actor } = useActor();

  return useQuery<Report[]>({
    queryKey: ['reports', status],
    queryFn: async () => {
      if (!actor) return [];
      const reports = await (actor as any).getReportsByStatus(status);
      return reports.sort((a: Report, b: Report) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor,
  });
}

export function useUpdateReportStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, newStatus }: { reportId: bigint; newStatus: ReportStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateReportStatus(reportId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report status updated successfully');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

// Education Queries
export function useGetAllLearningModules() {
  const { actor } = useActor();

  return useQuery<LearningModule[]>({
    queryKey: ['learningModules'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllLearningModules();
    },
    enabled: !!actor,
  });
}

export function useGetModulesByCategory(category: EducationCategory) {
  const { actor } = useActor();

  return useQuery<LearningModule[]>({
    queryKey: ['learningModules', category],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getModulesByCategory(category);
    },
    enabled: !!actor,
  });
}

export function useGetModulesByDifficulty(difficulty: DifficultyLevel) {
  const { actor } = useActor();

  return useQuery<LearningModule[]>({
    queryKey: ['learningModules', difficulty],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getModulesByDifficulty(difficulty);
    },
    enabled: !!actor,
  });
}

export function useGetAllQuizzes() {
  const { actor } = useActor();

  return useQuery<QuizQuestion[]>({
    queryKey: ['quizzes'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllQuizzes();
    },
    enabled: !!actor,
  });
}

export function useGetQuizzesByCategory(category: EducationCategory) {
  const { actor } = useActor();

  return useQuery<QuizQuestion[]>({
    queryKey: ['quizzes', category],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getQuizzesByCategory(category);
    },
    enabled: !!actor,
  });
}

export function useRecordModuleCompletion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).recordModuleCompletion(moduleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      toast.success('Module completed!');
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useSubmitQuizAnswers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quizId, questionIds, selectedOptions }: {
      quizId: bigint;
      questionIds: bigint[];
      selectedOptions: bigint[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitQuizAnswers(quizId, questionIds, selectedOptions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
    onError: (error: Error) => {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
    },
  });
}

export function useGetUserProgress(user: Principal | null) {
  const { actor } = useActor();

  return useQuery<UserProgress | null>({
    queryKey: ['userProgress', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return (actor as any).getUserProgress(user);
    },
    enabled: !!actor && !!user,
  });
}
