import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface LiveReaction {
    authorId: Principal;
    reactionType: LiveReactionType;
    timestamp: bigint;
    sessionId: bigint;
}
export interface CreateGroupArgs {
    creator: Principal;
    adminIds: Array<Principal>;
    name: string;
    createdAt: Time;
    description: string;
    coverImage?: ExternalBlob;
}
export interface Group {
    id: bigint;
    creator: Principal;
    name: string;
    createdAt: Time;
    description: string;
    coverImage?: ExternalBlob;
}
export interface Poll {
    id: bigint;
    creator: Principal;
    question: string;
    votes: Array<bigint>;
    isPublic: boolean;
    options: Array<string>;
}
export interface Page {
    owner: Principal;
    profileImage?: ExternalBlob;
    pageName: string;
    description: string;
    creationTime: Time;
    isPrivate: boolean;
    category: string;
}
export interface Post {
    id: bigint;
    postType: PostType;
    seriousLikeCount: bigint;
    likeCount: bigint;
    content: MediaContent;
    author: Principal;
    groupId?: bigint;
    isEdited: boolean;
    editHistory: Array<PostEdit>;
    timestamp: Time;
}
export interface CivicNotification {
    title: string;
    recipient: Principal;
    isRead: boolean;
    senderPrincipal?: Principal;
    message: string;
    timestamp: Time;
    relatedGroup?: bigint;
    category: string;
    notificationId: bigint;
    locationTarget?: string;
    relatedPost?: bigint;
}
export interface LiveComment {
    id: bigint;
    isModerated: boolean;
    upvotes: Array<Principal>;
    content: string;
    parentCommentId?: bigint;
    authorId: Principal;
    moderationReason?: string;
    timestamp: bigint;
    sessionId: bigint;
}
export interface MediaContent {
    video?: ExternalBlob;
    text?: string;
    image?: ExternalBlob;
}
export interface LiveSession {
    id: bigint;
    status: LiveSessionStatus;
    title: string;
    startedAt?: bigint;
    topic: string;
    endedAt?: bigint;
    scheduledTime: bigint;
    leader: Principal;
    constituency: string;
    viewerCount: bigint;
}
export interface PostEdit {
    content: MediaContent;
    timestamp: Time;
}
export interface UserProfile {
    bio: string;
    name: string;
    profilePhoto?: ExternalBlob;
    badges: Array<string>;
    civicTokenBalance: bigint;
    verifiedStatus: boolean;
    followerCount: bigint;
    location: string;
}
export enum DiscussionCategory {
    economy = "economy",
    socialIssues = "socialIssues",
    governance = "governance",
    policy = "policy"
}
export enum LiveReactionType {
    heart = "heart",
    clap = "clap",
    fire = "fire",
    wave = "wave"
}
export enum LiveSessionStatus {
    scheduled = "scheduled",
    live = "live",
    ended = "ended"
}
export enum PostType {
    regular = "regular",
    newsFeed = "newsFeed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLiveComment(sessionId: bigint, content: string, parentCommentId: bigint | null): Promise<bigint>;
    addLiveReaction(sessionId: bigint, reactionType: LiveReactionType): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCivicNotification(title: string, message: string, category: string, locationTarget: string | null): Promise<bigint>;
    createGroup(args: CreateGroupArgs): Promise<bigint>;
    createLiveSession(title: string, topic: string, constituency: string, scheduledTime: bigint): Promise<bigint>;
    createPage(pageName: string, category: string, description: string, profileImage: ExternalBlob | null, isPrivate: boolean): Promise<bigint>;
    createPoliticalDiscussion(title: string, context: string, region: string, category: DiscussionCategory): Promise<bigint>;
    createPoll(question: string, options: Array<string>, isPublic: boolean): Promise<bigint>;
    createPost(content: MediaContent, groupId: bigint | null, postType: PostType): Promise<bigint>;
    endLiveSession(sessionId: bigint): Promise<void>;
    getActiveSessions(): Promise<Array<LiveSession>>;
    getAllLiveSessions(): Promise<Array<LiveSession>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCivicNotifications(category: string | null): Promise<Array<CivicNotification>>;
    getGroup(groupId: bigint): Promise<Group | null>;
    getLeaderArchive(): Promise<Array<LiveSession>>;
    getLiveSession(sessionId: bigint): Promise<LiveSession | null>;
    getPage(pageId: bigint): Promise<Page | null>;
    getPoll(pollId: bigint): Promise<Poll | null>;
    getPost(postId: bigint): Promise<Post | null>;
    getScheduledSessions(): Promise<Array<LiveSession>>;
    getSessionComments(sessionId: bigint): Promise<Array<LiveComment>>;
    getSessionReactions(sessionId: bigint): Promise<Array<LiveReaction>>;
    getUnreadCivicNotificationCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    incrementSessionViewers(sessionId: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markAllCivicNotificationsRead(): Promise<boolean>;
    markCivicNotificationRead(notificationId: bigint): Promise<boolean>;
    moderateLiveComment(sessionId: bigint, commentId: bigint, reason: string): Promise<void>;
    reportLocalIssue(title: string, description: string, image: ExternalBlob | null, location: string | null, constituency: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startLiveSession(sessionId: bigint): Promise<void>;
    upvoteQuestion(sessionId: bigint, commentId: bigint): Promise<void>;
}
