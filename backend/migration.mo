import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  public type UserProfile = {
    name : Text;
    bio : Text;
    location : Text;
    profilePhoto : ?Storage.ExternalBlob;
    followerCount : Nat;
    badges : [Text];
    verifiedStatus : Bool;
    civicTokenBalance : Nat;
  };

  public type Wallet = {
    civPoints : Float;
    totalEarned : Float;
    dailyEarned : Float;
    level : Float;
    lastLoginDate : Int;
    lastResetDate : Int;
  };

  public type PointHistory = {
    userId : Principal;
    actionType : Text;
    points : Float;
    date : Int;
    status : Text;
  };

  public type Page = {
    pageName : Text;
    category : Text;
    description : Text;
    profileImage : ?Storage.ExternalBlob;
    owner : Principal;
    creationTime : Time.Time;
    isPrivate : Bool;
  };

  public type MediaContent = {
    text : ?Text;
    image : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
  };

  public type PostType = {
    #regular;
    #newsFeed;
  };

  public type PostEdit = {
    content : MediaContent;
    timestamp : Time.Time;
  };

  public type Post = {
    id : Nat;
    author : Principal;
    content : MediaContent;
    timestamp : Time.Time;
    likeCount : Nat;
    seriousLikeCount : Nat;
    groupId : ?Nat;
    postType : PostType;
    editHistory : [PostEdit];
    isEdited : Bool;
  };

  public type Comment = {
    id : Nat;
    postId : Text;
    authorId : Principal;
    content : Text;
    createdAt : Int;
    updatedAt : ?Int;
    parentCommentId : ?Nat;
    likes : [Principal];
    isDeleted : Bool;
  };

  public type Poll = {
    id : Nat;
    question : Text;
    options : [Text];
    votes : [Nat];
    isPublic : Bool;
    creator : Principal;
  };

  public type PollResponse = {
    pollId : Nat;
    user : Principal;
    selectedOption : Nat;
  };

  public type Message = {
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type HashtagData = {
    count : Nat;
    lastUsed : Time.Time;
  };

  public type TrendingHashtag = {
    word : Text;
    count : Nat;
  };

  public type Group = {
    id : Nat;
    name : Text;
    description : Text;
    creator : Principal;
    coverImage : ?Storage.ExternalBlob;
    createdAt : Time.Time;
  };

  public type GroupMembership = {
    groupId : Nat;
    user : Principal;
    joinedAt : Time.Time;
  };

  public type Notification = {
    notificationId : Nat;
    recipient : Principal;
    notificationType : Text;
    message : Text;
    timestamp : Time.Time;
    isRead : Bool;
    relatedPost : ?Nat;
    relatedGroup : ?Nat;
  };

  public type AnalyticsData = {
    totalPosts : Nat;
    totalLikes : Nat;
    totalComments : Nat;
    followerCount : Nat;
    pollParticipations : Nat;
    topPosts : [Post];
    topContributors : [UserProfile];
    trendingHashtags : [TrendingHashtag];
  };

  public type IssueStatus = {
    #new;
    #inReview;
    #resolved;
  };

  public type LocalIssue = {
    id : Nat;
    title : Text;
    description : Text;
    reporter : Principal;
    timestamp : Time.Time;
    status : IssueStatus;
    image : ?Storage.ExternalBlob;
    location : ?Text;
    constituency : Text;
  };

  public type Promise = {
    id : Nat;
    title : Text;
    description : Text;
    status : IssueStatus;
  };

  public type DiscussionCategory = {
    #policy;
    #governance;
    #economy;
    #socialIssues;
  };

  public type OpinionResponse = {
    #agree;
    #neutral;
    #disagree;
  };

  public type PoliticalDiscussion = {
    id : Nat;
    title : Text;
    context : Text;
    region : Text;
    category : DiscussionCategory;
    author : Principal;
    timestamp : Time.Time;
  };

  public type DiscussionResponse = {
    user : Principal;
    discussionId : Nat;
    response : OpinionResponse;
    timestamp : Time.Time;
  };

  public type ReportReason = {
    #spam;
    #misinformation;
    #inappropriateContent;
    #harassment;
    #other;
  };

  public type ReportTargetType = {
    #post;
    #comment;
    #profile;
  };

  public type ReportStatus = {
    #new;
    #reviewed;
    #resolved;
  };

  public type Report = {
    id : Nat;
    reporter : Principal;
    targetType : ReportTargetType;
    targetId : Nat;
    reason : ReportReason;
    details : Text;
    timestamp : Time.Time;
    status : ReportStatus;
  };

  public type VerifiedUser = {
    principal : Principal;
    isVerified : Bool;
    verificationTime : Time.Time;
  };

  public type EducationCategory = {
    #policy;
    #governance;
    #economy;
    #rightsAndDuties;
  };

  public type DifficultyLevel = {
    #beginner;
    #intermediate;
    #advanced;
  };

  public type LearningModule = {
    id : Nat;
    title : Text;
    summary : Text;
    content : Text;
    category : EducationCategory;
    readingTime : Nat;
    difficulty : DifficultyLevel;
    thumbnail : ?Storage.ExternalBlob;
  };

  public type QuestionType = {
    #multipleChoice;
    #trueFalse;
    #scenario;
  };

  public type QuizQuestion = {
    id : Nat;
    question : Text;
    options : [Text];
    correctAnswer : Nat;
    explanation : Text;
    category : EducationCategory;
    difficulty : DifficultyLevel;
    questionType : QuestionType;
  };

  public type QuizSubmission = {
    user : Principal;
    questionId : Nat;
    selectedOption : Nat;
    isCorrect : Bool;
    timestamp : Time.Time;
  };

  public type UserProgress = {
    modulesCompleted : [Nat];
    quizScores : [Nat];
    quizzesCompleted : [Nat];
  };

  public type Country = {
    code : Text;
    name : Text;
    region : Text;
    subRegion : Text;
    continent : Text;
  };

  public type LevelHierarchy = {
    level : Nat;
    name : Text;
  };

  public type Location = {
    id : Nat;
    code : Text;
    name : Text;
    countryCode : Text;
    level : Nat;
    parentLocationId : ?Nat;
    children : [Nat];
    hierarchy : [LevelHierarchy];
  };

  public type LocationQuery = {
    countryCode : Text;
    level : Nat;
    parentId : ?Nat;
    maxResults : ?Nat;
    filterBy : ?Text;
    searchText : ?Text;
  };

  public type LocationQueryResult = {
    status : Text;
    message : Text;
    locations : [Location];
  };

  public type HierarchyResponse = {
    countryCode : Text;
    hierarchy : [LevelHierarchy];
  };

  public type CreateGroupArgs = {
    name : Text;
    description : Text;
    coverImage : ?Storage.ExternalBlob;
    adminIds : [Principal];
    createdAt : Time.Time;
    creator : Principal;
  };

  type OldActor = {
    countries : [Country];
    countryHierarchies : [HierarchyResponse];
    locations : [Location];
    postCounter : Nat;
    pollCounter : Nat;
    messageCounter : Nat;
    groupCounter : Nat;
    notificationCounter : Nat;
    issueCounter : Nat;
    discussionCounter : Nat;
    reportCounter : Nat;
    learningModuleCounter : Nat;
    quizQuestionCounter : Nat;
    commentCounter : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    wallets : Map.Map<Principal, Wallet>;
    pointHistories : Map.Map<Principal, List.List<PointHistory>>;
    posts : Map.Map<Nat, Post>;
    postLikes : Map.Map<Nat, Set.Set<Principal>>;
    comments : Map.Map<Nat, Comment>;
    polls : Map.Map<Nat, Poll>;
    pollResponses : Map.Map<Nat, List.List<PollResponse>>;
    followers : Map.Map<Principal, Set.Set<Principal>>;
    conversations : Map.Map<Text, List.List<Message>>;
    hashtags : Map.Map<Text, HashtagData>;
    verifiedUsers : Map.Map<Principal, VerifiedUser>;
    groups : Map.Map<Nat, Group>;
    groupMemberships : Map.Map<Nat, List.List<GroupMembership>>;
    notifications : Map.Map<Principal, List.List<Notification>>;
    localIssues : Map.Map<Nat, LocalIssue>;
    politicalDiscussions : Map.Map<Nat, PoliticalDiscussion>;
    discussionResponses : Map.Map<Nat, List.List<DiscussionResponse>>;
    reports : Map.Map<Nat, Report>;
    learningModules : Map.Map<Nat, LearningModule>;
    quizQuestions : Map.Map<Nat, QuizQuestion>;
    quizSubmissions : Map.Map<Nat, List.List<QuizSubmission>>;
    userProgress : Map.Map<Principal, UserProgress>;
    pages : Map.Map<Nat, Page>;
    pageCounter : Nat;
    suspendedUsers : Map.Map<Principal, Bool>;
    postReports : Map.Map<Nat, List.List<Report>>;
  };

  type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    old;
  };
};
