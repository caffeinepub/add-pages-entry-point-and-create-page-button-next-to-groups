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
export interface MediaContent {
    video?: ExternalBlob;
    text?: string;
    image?: ExternalBlob;
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
    createGroup(args: CreateGroupArgs): Promise<bigint>;
    createPage(pageName: string, category: string, description: string, profileImage: ExternalBlob | null, isPrivate: boolean): Promise<bigint>;
    createPoll(question: string, options: Array<string>, isPublic: boolean): Promise<bigint>;
    createPost(content: MediaContent, groupId: bigint | null, postType: PostType): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGroup(groupId: bigint): Promise<Group | null>;
    getPage(pageId: bigint): Promise<Page | null>;
    getPoll(pollId: bigint): Promise<Poll | null>;
    getPost(postId: bigint): Promise<Post | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
