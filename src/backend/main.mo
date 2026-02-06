import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Time "mo:core/Time";
import Set "mo:core/Set";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



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
    postId : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
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

  // Education Types
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

  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Nat, Post>();
  let comments = Map.empty<Nat, List.List<Comment>>();
  let postLikes = Map.empty<Nat, Set.Set<Principal>>();
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

  // Helper function to check if user is verified
  func isUserVerified(user : Principal) : Bool {
    switch (verifiedUsers.get(user)) {
      case (?verifiedUser) { verifiedUser.isVerified };
      case null { false };
    };
  };

  // Social Posts
  public query ({ caller }) func getAllPosts() : async [Post] {
    posts.values().toArray();
  };

  public query ({ caller }) func getUserPosts(user : Principal) : async [Post] {
    let all = posts.values().toArray();
    let filtered = all.filter(
      func(post) { post.author == user }
    );
    filtered;
  };

  public query ({ caller }) func getNewsFeedPosts() : async [Post] {
    let all = posts.values().toArray();
    let filtered = all.filter(
      func(post) {
        switch (post.postType) {
          case (#newsFeed) { true };
          case (#regular) { false };
        };
      }
    );
    filtered;
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

  public shared ({ caller }) func createPost(content : MediaContent, groupId : ?Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can create posts");
    };

    let hasText = isTextValid(content.text);
    let hasImage = content.image.isSome();
    let hasVideo = content.video.isSome();

    if (not hasText and not hasImage and not hasVideo) {
      Runtime.trap("Content must include text, image, or video");
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
      postType = #regular;
    };

    posts.add(postId, newPost);
    postId;
  };

  public shared ({ caller }) func createNewsFeedPost(content : MediaContent) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can create posts");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isVerified = isUserVerified(caller);

    if (not isAdmin and not isVerified) {
      Runtime.trap("Unauthorized: Only admin or verified users can create News Feed posts");
    };

    let hasText = isTextValid(content.text);
    let hasImage = content.image.isSome();
    let hasVideo = content.video.isSome();

    if (not hasText and not hasImage and not hasVideo) {
      Runtime.trap("Content must include text, image, or video");
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
      groupId = null;
      postType = #newsFeed;
    };

    posts.add(postId, newPost);
    postId;
  };

  public shared ({ caller }) func deletePost(postId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can delete posts");
    };

    switch (posts.get(postId)) {
      case null {
        Runtime.trap("Post not found");
      };
      case (?post) {
        let isOwner = post.author == caller;
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);

        if (not isOwner and not isAdmin) {
          Runtime.trap("Unauthorized: Only the post owner or admin can delete this post");
        };

        posts.remove(postId);
        comments.remove(postId);
        postLikes.remove(postId);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
