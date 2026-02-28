import Array "mo:core/Array";
import Float "mo:core/Float";
import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  public type Post = {
    id : Nat;
    author : Principal;
    content : MediaContent;
    timestamp : Time.Time;
    likeCount : Nat;
    seriousLikeCount : Nat;
    groupId : ?Nat;
    postType : PostType;
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

  var countries : [Country] = [];
  var countryHierarchies : [HierarchyResponse] = [];
  var locations : [Location] = [];
  var postCounter = 0;
  var pollCounter = 0;
  var messageCounter = 0;
  var groupCounter = 0;
  var notificationCounter = 0;
  var issueCounter = 0;
  var discussionCounter = 0;
  var reportCounter = 0;
  var learningModuleCounter = 0;
  var quizQuestionCounter = 0;
  var commentCounter = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let wallets = Map.empty<Principal, Wallet>();
  let pointHistories = Map.empty<Principal, List.List<PointHistory>>();
  let posts = Map.empty<Nat, Post>();
  let postLikes = Map.empty<Nat, Set.Set<Principal>>();
  let comments = Map.empty<Nat, Comment>();
  let polls = Map.empty<Nat, Poll>();
  let pollResponses = Map.empty<Nat, List.List<PollResponse>>();
  let followers = Map.empty<Principal, Set.Set<Principal>>();
  let conversations = Map.empty<Text, List.List<Message>>();
  let hashtags = Map.empty<Text, HashtagData>();
  let verifiedUsers = Map.empty<Principal, VerifiedUser>();
  let groups = Map.empty<Nat, Group>();
  let groupMemberships = Map.empty<Nat, List.List<GroupMembership>>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  let localIssues = Map.empty<Nat, LocalIssue>();
  let politicalDiscussions = Map.empty<Nat, PoliticalDiscussion>();
  let discussionResponses = Map.empty<Nat, List.List<DiscussionResponse>>();
  let reports = Map.empty<Nat, Report>();
  let learningModules = Map.empty<Nat, LearningModule>();
  let quizQuestions = Map.empty<Nat, QuizQuestion>();
  let quizSubmissions = Map.empty<Nat, List.List<QuizSubmission>>();
  let userProgress = Map.empty<Principal, UserProgress>();
  let pages = Map.empty<Nat, Page>();
  var pageCounter = 0;
  let suspendedUsers = Map.empty<Principal, Bool>();

  func isUserVerified(user : Principal) : Bool {
    switch (verifiedUsers.get(user)) {
      case (?verifiedUser) { verifiedUser.isVerified };
      case null { false };
    };
  };

  func isUserSuspended(user : Principal) : Bool {
    suspendedUsers.get(user) == ?true;
  };

  public type PollResults = {
    votes : [Nat];
    totalResponses : Nat;
    userVote : ?Nat;
  };

  func isTextValid(text : ?Text) : Bool {
    switch (text) {
      case (null) { false };
      case (?value) {
        let trimmed = value.trim(#char(' '));
        trimmed.size() > 0;
      };
    };
  };
};
