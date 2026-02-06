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
export interface UserProfile {
    bio: string;
    name: string;
    profilePhoto?: ExternalBlob;
    badges: Array<string>;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createNewsFeedPost(content: MediaContent): Promise<bigint>;
    createPost(content: MediaContent, groupId: bigint | null): Promise<bigint>;
    deletePost(postId: bigint): Promise<void>;
    getAllPosts(): Promise<Array<Post>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getNewsFeedPosts(): Promise<Array<Post>>;
    getUserPosts(user: Principal): Promise<Array<Post>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
