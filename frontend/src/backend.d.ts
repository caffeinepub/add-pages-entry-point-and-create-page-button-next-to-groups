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
export interface Comment {
    id: bigint;
    isDeleted: boolean;
    content: string;
    parentCommentId?: bigint;
    authorId: Principal;
    createdAt: bigint;
    likes: Array<Principal>;
    updatedAt?: bigint;
    postId: string;
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
export interface Wallet {
    lastLoginDate: bigint;
    dailyEarned: number;
    totalEarned: number;
    civPoints: number;
    level: number;
    lastResetDate: bigint;
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
export interface GroupMembership {
    joinedAt: Time;
    user: Principal;
    groupId: bigint;
}
export interface Post {
    id: bigint;
    postType: PostType;
    seriousLikeCount: bigint;
    likeCount: bigint;
    content: MediaContent;
    author: Principal;
    groupId?: bigint;
    timestamp: Time;
}
export interface MediaContent {
    video?: ExternalBlob;
    text?: string;
    image?: ExternalBlob;
}
export interface PointHistory {
    status: string;
    userId: Principal;
    date: bigint;
    actionType: string;
    points: number;
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
    addComment(postId: string, content: string, parentCommentId: bigint | null): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGroup(name: string, description: string, coverImage: ExternalBlob | null): Promise<bigint>;
    createNewsFeedPost(content: MediaContent): Promise<bigint>;
    createPage(pageName: string, category: string, description: string, profileImage: ExternalBlob | null, isPrivate: boolean): Promise<bigint>;
    createPoll(question: string, options: Array<string>, isPublic: boolean): Promise<bigint>;
    createPost(content: MediaContent, groupId: bigint | null): Promise<bigint>;
    deleteComment(commentId: bigint): Promise<void>;
    deleteGroup(groupId: bigint): Promise<void>;
    deletePost(postId: bigint): Promise<void>;
    editComment(commentId: bigint, newContent: string): Promise<void>;
    getAllPages(): Promise<Array<Page>>;
    getCallerPointHistory(): Promise<Array<PointHistory>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerWallet(): Promise<Wallet | null>;
    getCommentLikeCount(commentId: bigint): Promise<bigint>;
    getCommentsByPost(postId: string): Promise<Array<Comment>>;
    getCountries(): Promise<Array<string>>;
    getDistrictsByState(state: string): Promise<Array<string>>;
    getGroup(groupId: bigint): Promise<Group | null>;
    getGroupMembers(groupId: bigint): Promise<Array<GroupMembership>>;
    getGroups(): Promise<Array<Group>>;
    getPointHistory(user: Principal): Promise<Array<PointHistory>>;
    getPoll(pollId: bigint): Promise<Poll | null>;
    getPolls(): Promise<Array<Poll>>;
    getPost(postId: bigint): Promise<Post | null>;
    getPosts(): Promise<Array<Post>>;
    getStatesByCountry(_country: string): Promise<Array<string>>;
    getUserPages(user: Principal): Promise<Array<Page>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWallet(user: Principal): Promise<Wallet | null>;
    hasLikedPost(postId: bigint): Promise<boolean>;
    hasVotedOnPoll(pollId: bigint): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    joinGroup(groupId: bigint): Promise<void>;
    leaveGroup(groupId: bigint): Promise<void>;
    likeComment(commentId: bigint): Promise<void>;
    likePost(postId: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unlikePost(postId: bigint): Promise<bigint>;
    votePoll(pollId: bigint, optionIndex: bigint): Promise<Poll>;
}
