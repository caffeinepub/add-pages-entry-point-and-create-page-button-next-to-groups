import Array "mo:core/Array";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Migration "migration";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

(with migration = Migration.run)
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
  let postReports = Map.empty<Nat, List.List<Report>>();

  // User profile management

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Post management

  public shared ({ caller }) func createPost(content : MediaContent, groupId : ?Nat, postType : PostType) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let postId = postCounter;
    postCounter += 1;

    let newPost : Post = {
      id = postId;
      author = caller;
      content;
      timestamp = Time.now();
      likeCount = 0;
      seriousLikeCount = 0;
      groupId;
      postType;
      editHistory = [];
      isEdited = false;
    };

    posts.add(postId, newPost);

    let likes = Set.empty<Principal>();
    postLikes.add(postId, likes);

    postId;
  };

  // Poll management

  public shared ({ caller }) func createPoll(question : Text, options : [Text], isPublic : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create polls");
    };

    let pollId = pollCounter;
    pollCounter += 1;

    let votes = Array.tabulate(options.size(), func(_) { 0 });

    let newPoll : Poll = {
      id = pollId;
      question;
      options;
      votes;
      isPublic;
      creator = caller;
    };

    polls.add(pollId, newPoll);

    let responses = List.empty<PollResponse>();
    pollResponses.add(pollId, responses);

    pollId;
  };

  // Group management

  public shared ({ caller }) func createGroup(args : CreateGroupArgs) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create groups");
    };

    let groupId = groupCounter;
    groupCounter += 1;

    let newGroup : Group = {
      id = groupId;
      name = args.name;
      description = args.description;
      creator = caller;
      coverImage = args.coverImage;
      createdAt = Time.now();
    };

    groups.add(groupId, newGroup);

    let memberships = List.empty<GroupMembership>();
    groupMemberships.add(groupId, memberships);

    groupId;
  };

  // Page management

  public shared ({ caller }) func createPage(pageName : Text, category : Text, description : Text, profileImage : ?Storage.ExternalBlob, isPrivate : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create pages");
    };

    let pageId = pageCounter;
    pageCounter += 1;

    let newPage : Page = {
      pageName;
      category;
      description;
      profileImage;
      owner = caller;
      creationTime = Time.now();
      isPrivate;
    };

    pages.add(pageId, newPage);

    pageId;
  };

  // Read-only queries (accessible to all, including guests)

  public query func getPost(postId : Nat) : async ?Post {
    posts.get(postId);
  };

  public query func getPoll(pollId : Nat) : async ?Poll {
    polls.get(pollId);
  };

  public query func getGroup(groupId : Nat) : async ?Group {
    groups.get(groupId);
  };

  public query func getPage(pageId : Nat) : async ?Page {
    pages.get(pageId);
  };
};
