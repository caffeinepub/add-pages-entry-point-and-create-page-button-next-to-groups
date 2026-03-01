import type { Principal } from "@icp-sdk/core/principal";

// PostType defined locally since it's not exported from backend
export type PostType = 'regular' | 'newsFeed';

// User Profile Types
export interface UserProfile {
  name: string;
  bio: string;
  location: string;
  profilePhoto: any | null;
  followerCount: bigint;
  badges: string[];
  verifiedStatus: boolean;
  civicTokenBalance: bigint;
}

// Wallet Types
export interface Wallet {
  civPoints: number;
  totalEarned: number;
  dailyEarned: number;
  level: number;
  lastLoginDate: bigint;
  lastResetDate: bigint;
}

// Point History Types
export interface PointHistory {
  userId: Principal;
  actionType: string;
  points: number;
  date: bigint;
  status: string;
}

// Media Content Types
export interface MediaContent {
  text: string | null;
  image: any | null;
  video: any | null;
}

// Post Edit (audit history entry)
export interface PostEdit {
  content: MediaContent;
  timestamp: bigint;
}

// Post Types
export interface Post {
  id: bigint;
  author: Principal;
  content: MediaContent;
  timestamp: bigint;
  likeCount: bigint;
  seriousLikeCount: bigint;
  groupId: bigint | null;
  postType: PostType;
  editHistory: PostEdit[];
  isEdited: boolean;
}

// Comment Types — matches the backend Comment shape
export interface Comment {
  id: bigint;
  postId: string;
  authorId: Principal;
  content: string;
  createdAt: bigint;
  updatedAt: bigint | null | undefined;
  parentCommentId: bigint | null | undefined | bigint[];
  likes: Principal[];
  isDeleted: boolean;
}

// Poll Types
export interface Poll {
  id: bigint;
  question: string;
  options: string[];
  votes: bigint[];
  isPublic: boolean;
  creator: Principal;
}

export interface PollResponse {
  pollId: bigint;
  user: Principal;
  selectedOption: bigint;
}

// Message Types
export interface Message {
  sender: Principal;
  receiver: Principal;
  content: string;
  timestamp: bigint;
}

// Hashtag Types
export interface HashtagData {
  count: bigint;
  lastUsed: bigint;
}

export interface TrendingHashtag {
  word: string;
  count: bigint;
}

// Group Types
export interface Group {
  id: bigint;
  name: string;
  description: string;
  creator: Principal;
  coverImage: any | null;
  createdAt: bigint;
}

export interface GroupMembership {
  groupId: bigint;
  user: Principal;
  joinedAt: bigint;
}

// Page Types
export interface Page {
  pageName: string;
  category: string;
  description: string;
  profileImage: any | null;
  owner: Principal;
  creationTime: bigint;
  isPrivate: boolean;
}

// Notification Types
export interface Notification {
  notificationId: bigint;
  recipient: Principal;
  notificationType: string;
  message: string;
  timestamp: bigint;
  isRead: boolean;
  relatedPost: bigint | null;
  relatedGroup: bigint | null;
}

// Analytics Types
export interface AnalyticsData {
  totalPosts: bigint;
  totalLikes: bigint;
  totalComments: bigint;
  followerCount: bigint;
  pollParticipations: bigint;
  topPosts: Post[];
  topContributors: UserProfile[];
  trendingHashtags: TrendingHashtag[];
}

// Issue Status Types
export enum IssueStatus {
  new = "new",
  inReview = "inReview",
  resolved = "resolved"
}

// Local Issue Types
export interface LocalIssue {
  id: bigint;
  title: string;
  description: string;
  reporter: Principal;
  timestamp: bigint;
  status: IssueStatus;
  image: any | null;
  location: string | null;
  constituency: string;
}

// Promise Types
export interface Promise_ {
  id: bigint;
  title: string;
  description: string;
  status: IssueStatus;
}

// Discussion Types
export enum DiscussionCategory {
  policy = "policy",
  governance = "governance",
  economy = "economy",
  socialIssues = "socialIssues"
}

export enum OpinionResponse {
  agree = "agree",
  neutral = "neutral",
  disagree = "disagree"
}

export interface PoliticalDiscussion {
  id: bigint;
  title: string;
  context: string;
  region: string;
  category: DiscussionCategory;
  author: Principal;
  timestamp: bigint;
}

export interface DiscussionResponse {
  user: Principal;
  discussionId: bigint;
  response: OpinionResponse;
  timestamp: bigint;
}

// Report Types
export enum ReportReason {
  spam = "spam",
  misinformation = "misinformation",
  inappropriateContent = "inappropriateContent",
  harassment = "harassment",
  hateSpeech = "hateSpeech",
  other = "other"
}

export enum ReportTargetType {
  post = "post",
  comment = "comment",
  profile = "profile"
}

export enum ReportStatus {
  new = "new",
  reviewed = "reviewed",
  resolved = "resolved"
}

export interface Report {
  id: bigint;
  reporter: Principal;
  targetType: ReportTargetType;
  targetId: bigint;
  reason: ReportReason;
  details: string;
  timestamp: bigint;
  status: ReportStatus;
}

// Education Types
export type EducationCategory = 'policy' | 'governance' | 'economy' | 'rightsAndDuties';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type QuestionType = 'multipleChoice' | 'trueFalse' | 'scenario';

export interface LearningModule {
  id: bigint;
  title: string;
  summary: string;
  content: string;
  category: EducationCategory;
  readingTime: bigint;
  difficulty: DifficultyLevel;
  thumbnail: any | null;
}

export interface QuizQuestion {
  id: bigint;
  question: string;
  options: string[];
  correctAnswer: bigint;
  explanation: string;
  category: EducationCategory;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
}

export interface QuizSubmission {
  user: Principal;
  questionId: bigint;
  selectedOption: bigint;
  isCorrect: boolean;
  timestamp: bigint;
}

export interface UserProgress {
  modulesCompleted: bigint[];
  quizScores: bigint[];
  quizzesCompleted: bigint[];
}
