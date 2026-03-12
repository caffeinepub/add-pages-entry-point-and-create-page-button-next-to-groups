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

import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
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

  public type CivicNotification = {
    notificationId : Nat;
    recipient : Principal;
    category : Text;
    title : Text;
    message : Text;
    timestamp : Time.Time;
    isRead : Bool;
    locationTarget : ?Text;
    senderPrincipal : ?Principal;
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
  var civicNotificationCounter = 0;
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
  let civicNotifications = Map.empty<Principal, List.List<CivicNotification>>();
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

  // Live Sessions Types
  public type LiveSessionStatus = {
    #scheduled;
    #live;
    #ended;
  };

  public type LiveSession = {
    id : Nat;
    title : Text;
    topic : Text;
    leader : Principal;
    constituency : Text;
    scheduledTime : Int;
    startedAt : ?Int;
    endedAt : ?Int;
    status : LiveSessionStatus;
    viewerCount : Nat;
  };

  public type LiveComment = {
    id : Nat;
    sessionId : Nat;
    authorId : Principal;
    content : Text;
    timestamp : Int;
    upvotes : [Principal];
    parentCommentId : ?Nat;
    isModerated : Bool;
    moderationReason : ?Text;
  };

  public type LiveReactionType = {
    #fire;
    #heart;
    #clap;
    #wave;
  };

  public type LiveReaction = {
    sessionId : Nat;
    authorId : Principal;
    reactionType : LiveReactionType;
    timestamp : Int;
  };

  // Live Sessions State
  var liveSessionCounter = 0;
  var liveCommentCounter = 0;
  let liveSessions = Map.empty<Nat, LiveSession>();
  let liveSessionComments = Map.empty<Nat, List.List<LiveComment>>();
  let liveSessionReactions = Map.empty<Nat, List.List<LiveReaction>>();

  // Helper function to check if content contains flagged words
  func containsFlaggedWords(content : Text) : Bool {
    let lowerContent = content.toLower();
    let flaggedWords = ["abuse", "hate", "kill", "idiot", "stupid"];
    for (word in flaggedWords.vals()) {
      if (lowerContent.contains(#text word)) {
        return true;
      };
    };
    false;
  };

  // Helper function to check if user is verified leader
  func isVerifiedLeader(user : Principal) : Bool {
    switch (userProfiles.get(user)) {
      case (null) { false };
      case (?profile) { profile.verifiedStatus };
    };
  };

  // Helper function to match location target
  func matchesLocationTarget(userLocation : Text, targetLocation : ?Text) : Bool {
    switch (targetLocation) {
      case (null) { true };
      case (?target) {
        userLocation.contains(#text target);
      };
    };
  };

  // Internal helper to trigger civic notifications
  func triggerCivicNotification(title : Text, message : Text, category : Text, locationTarget : ?Text, sender : ?Principal) {
    let notifId = civicNotificationCounter;
    civicNotificationCounter += 1;

    for ((userPrincipal, profile) in userProfiles.entries()) {
      if (matchesLocationTarget(profile.location, locationTarget)) {
        let notification : CivicNotification = {
          notificationId = notifId;
          recipient = userPrincipal;
          category;
          title;
          message;
          timestamp = Time.now();
          isRead = false;
          locationTarget;
          senderPrincipal = sender;
          relatedPost = null;
          relatedGroup = null;
        };

        switch (civicNotifications.get(userPrincipal)) {
          case (null) {
            let notifList = List.empty<CivicNotification>();
            notifList.add(notification);
            civicNotifications.add(userPrincipal, notifList);
          };
          case (?notifList) {
            notifList.add(notification);
          };
        };
      };
    };
  };

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

    // Trigger civic notification for poll creation
    switch (userProfiles.get(caller)) {
      case (?profile) {
        triggerCivicNotification(
          "New Poll Created",
          "A new poll has been created: " # question,
          "poll",
          ?profile.location,
          ?caller
        );
      };
      case (null) {};
    };

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

  // Civic Issue Reporting

  public shared ({ caller }) func reportLocalIssue(title : Text, description : Text, image : ?Storage.ExternalBlob, location : ?Text, constituency : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can report local issues");
    };

    let issueId = issueCounter;
    issueCounter += 1;

    let newIssue : LocalIssue = {
      id = issueId;
      title;
      description;
      reporter = caller;
      timestamp = Time.now();
      status = #new;
      image;
      location;
      constituency;
    };

    localIssues.add(issueId, newIssue);

    // Trigger civic notification for issue reporting
    triggerCivicNotification(
      "New Civic Issue Reported",
      title # " - " # description,
      "civic_issue",
      location,
      ?caller
    );

    issueId;
  };

  // Political Discussion

  public shared ({ caller }) func createPoliticalDiscussion(title : Text, context : Text, region : Text, category : DiscussionCategory) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create political discussions");
    };

    let discussionId = discussionCounter;
    discussionCounter += 1;

    let newDiscussion : PoliticalDiscussion = {
      id = discussionId;
      title;
      context;
      region;
      category;
      author = caller;
      timestamp = Time.now();
    };

    politicalDiscussions.add(discussionId, newDiscussion);

    let responses = List.empty<DiscussionResponse>();
    discussionResponses.add(discussionId, responses);

    // Trigger civic notification for discussion creation
    triggerCivicNotification(
      "New Political Discussion",
      title # " - " # context,
      "community",
      ?region,
      ?caller
    );

    discussionId;
  };

  // Civic Notification System

  public shared ({ caller }) func createCivicNotification(title : Text, message : Text, category : Text, locationTarget : ?Text) : async Nat {
    // Only admins or verified leaders can create civic notifications
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isLeader = isVerifiedLeader(caller);

    if (not (isAdmin or isLeader)) {
      Runtime.trap("Unauthorized: Only admins or verified leaders can create civic notifications");
    };

    let notifId = civicNotificationCounter;
    civicNotificationCounter += 1;

    // Broadcast to matching users
    for ((userPrincipal, profile) in userProfiles.entries()) {
      if (matchesLocationTarget(profile.location, locationTarget)) {
        let notification : CivicNotification = {
          notificationId = notifId;
          recipient = userPrincipal;
          category;
          title;
          message;
          timestamp = Time.now();
          isRead = false;
          locationTarget;
          senderPrincipal = ?caller;
          relatedPost = null;
          relatedGroup = null;
        };

        switch (civicNotifications.get(userPrincipal)) {
          case (null) {
            let notifList = List.empty<CivicNotification>();
            notifList.add(notification);
            civicNotifications.add(userPrincipal, notifList);
          };
          case (?notifList) {
            notifList.add(notification);
          };
        };
      };
    };

    notifId;
  };

  public query ({ caller }) func getCivicNotifications(category : ?Text) : async [CivicNotification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get civic notifications");
    };

    switch (civicNotifications.get(caller)) {
      case (null) { [] };
      case (?notifList) {
        let allNotifs = notifList.toArray();
        let filtered = switch (category) {
          case (null) { allNotifs };
          case (?cat) {
            allNotifs.filter(func(n) { n.category == cat });
          };
        };
        // Sort by timestamp, newest first
        filtered.sort(func(a : CivicNotification, b : CivicNotification) : { #less; #equal; #greater } {
          if (a.timestamp > b.timestamp) { #less }
          else if (a.timestamp < b.timestamp) { #greater }
          else { #equal }
        });
      };
    };
  };

  public query ({ caller }) func getUnreadCivicNotificationCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get unread notification count");
    };

    switch (civicNotifications.get(caller)) {
      case (null) { 0 };
      case (?notifList) {
        let allNotifs = notifList.toArray();
        allNotifs.filter(func(n) { not n.isRead }).size();
      };
    };
  };

  public shared ({ caller }) func markCivicNotificationRead(notificationId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    switch (civicNotifications.get(caller)) {
      case (null) { false };
      case (?notifList) {
        let allNotifs = notifList.toArray();
        var found = false;

        let updatedNotifs = List.empty<CivicNotification>();
        for (notif in allNotifs.vals()) {
          if (notif.notificationId == notificationId and notif.recipient == caller) {
            found := true;
            let updatedNotif = {
              notif with
              isRead = true;
            };
            updatedNotifs.add(updatedNotif);
          } else {
            updatedNotifs.add(notif);
          };
        };

        if (found) {
          civicNotifications.add(caller, updatedNotifs);
        };

        found;
      };
    };
  };

  public shared ({ caller }) func markAllCivicNotificationsRead() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    switch (civicNotifications.get(caller)) {
      case (null) { false };
      case (?notifList) {
        let allNotifs = notifList.toArray();
        let updatedNotifs = List.empty<CivicNotification>();

        for (notif in allNotifs.vals()) {
          let updatedNotif = {
            notif with
            isRead = true;
          };
          updatedNotifs.add(updatedNotif);
        };

        civicNotifications.add(caller, updatedNotifs);
        true;
      };
    };
  };

  // Live Sessions Implementation

  public shared ({ caller }) func createLiveSession(title : Text, topic : Text, constituency : Text, scheduledTime : Int) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create live sessions");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Only verified leaders can create live sessions") };
      case (?profile) {
        if (not profile.verifiedStatus) {
          Runtime.trap("Unauthorized: Only verified leaders can create live sessions");
        };

        let id = liveSessionCounter;
        liveSessionCounter += 1;

        let liveSession : LiveSession = {
          id;
          title;
          topic;
          leader = caller;
          constituency;
          scheduledTime;
          startedAt = null;
          endedAt = null;
          status = #scheduled;
          viewerCount = 0;
        };

        liveSessions.add(id, liveSession);
        let comments = List.empty<LiveComment>();
        let reactions = List.empty<LiveReaction>();
        liveSessionComments.add(id, comments);
        liveSessionReactions.add(id, reactions);

        id;
      };
    };
  };

  public shared ({ caller }) func startLiveSession(sessionId : Nat) : async () {
    switch (liveSessions.get(sessionId)) {
      case (null) { Runtime.trap("Live session not found") };
      case (?session) {
        if (caller != session.leader) {
          Runtime.trap("Unauthorized: Only the session leader can start the session");
        };
        let updatedSession = {
          session with
          status = #live;
          startedAt = ?Int.abs(Time.now());
        };
        liveSessions.add(sessionId, updatedSession);
      };
    };
  };

  public shared ({ caller }) func endLiveSession(sessionId : Nat) : async () {
    switch (liveSessions.get(sessionId)) {
      case (null) { Runtime.trap("Live session not found") };
      case (?session) {
        if (caller != session.leader) {
          Runtime.trap("Unauthorized: Only the session leader can end the session");
        };
        let updatedSession = {
          session with
          status = #ended;
          endedAt = ?Int.abs(Time.now());
        };
        liveSessions.add(sessionId, updatedSession);
      };
    };
  };

  public query func getLiveSession(sessionId : Nat) : async ?LiveSession {
    liveSessions.get(sessionId);
  };

  public query func getAllLiveSessions() : async [LiveSession] {
    liveSessions.values().toArray();
  };

  public query func getActiveSessions() : async [LiveSession] {
    liveSessions.values().toArray().filter(func(s) { s.status == #live });
  };

  public query func getScheduledSessions() : async [LiveSession] {
    liveSessions.values().toArray().filter(func(s) { s.status == #scheduled });
  };

  public query func getLeaderArchive() : async [LiveSession] {
    liveSessions.values().toArray().filter(func(s) { s.status == #ended });
  };

  public shared ({ caller }) func addLiveComment(sessionId : Nat, content : Text, parentCommentId : ?Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    switch (liveSessions.get(sessionId)) {
      case (null) { Runtime.trap("Live session not found") };
      case (?_) {
        let id = liveCommentCounter;
        liveCommentCounter += 1;

        let isFlagged = containsFlaggedWords(content);

        let comment : LiveComment = {
          id;
          sessionId;
          authorId = caller;
          content;
          timestamp = Int.abs(Time.now());
          upvotes = [];
          parentCommentId;
          isModerated = isFlagged;
          moderationReason = if (isFlagged) { ?"Content contains inappropriate language" } else { null };
        };

        switch (liveSessionComments.get(sessionId)) {
          case (null) {
            let comments = List.empty<LiveComment>();
            comments.add(comment);
            liveSessionComments.add(sessionId, comments);
          };
          case (?comments) {
            comments.add(comment);
          };
        };
        id;
      };
    };
  };

  public shared ({ caller }) func upvoteQuestion(sessionId : Nat, commentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upvote questions");
    };

    switch (liveSessionComments.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?commentsList) {
        let commentsArray = commentsList.toArray();
        var found = false;

        for (i in commentsArray.keys()) {
          let comment = commentsArray[i];
          if (comment.id == commentId and comment.parentCommentId == null) {
            found := true;
            let currentUpvotes = comment.upvotes;
            let hasUpvoted = currentUpvotes.find(func(p) { p == caller });

            let newUpvotes = switch (hasUpvoted) {
              case (?_) {
                currentUpvotes.filter(func(p) { p != caller });
              };
              case (null) {
                currentUpvotes.concat([caller]);
              };
            };

            let updatedComment = {
              comment with
              upvotes = newUpvotes;
            };

            let newCommentsList = List.empty<LiveComment>();
            for (j in commentsArray.keys()) {
              if (j == i) {
                newCommentsList.add(updatedComment);
              } else {
                newCommentsList.add(commentsArray[j]);
              };
            };
            liveSessionComments.add(sessionId, newCommentsList);
          };
        };

        if (not found) {
          Runtime.trap("Comment not found or is not a top-level question");
        };
      };
    };
  };

  public shared ({ caller }) func moderateLiveComment(sessionId : Nat, commentId : Nat, reason : Text) : async () {
    switch (liveSessions.get(sessionId)) {
      case (null) { Runtime.trap("Live session not found") };
      case (?session) {
        let isLeader = caller == session.leader;
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);

        if (not (isLeader or isAdmin)) {
          Runtime.trap("Unauthorized: Only the session leader or admin can moderate comments");
        };

        switch (liveSessionComments.get(sessionId)) {
          case (null) { Runtime.trap("Session comments not found") };
          case (?commentsList) {
            let commentsArray = commentsList.toArray();
            var found = false;

            for (i in commentsArray.keys()) {
              let comment = commentsArray[i];
              if (comment.id == commentId) {
                found := true;
                let updatedComment = {
                  comment with
                  isModerated = true;
                  moderationReason = ?reason;
                };

                let newCommentsList = List.empty<LiveComment>();
                for (j in commentsArray.keys()) {
                  if (j == i) {
                    newCommentsList.add(updatedComment);
                  } else {
                    newCommentsList.add(commentsArray[j]);
                  };
                };
                liveSessionComments.add(sessionId, newCommentsList);
              };
            };

            if (not found) {
              Runtime.trap("Comment not found");
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func addLiveReaction(sessionId : Nat, reactionType : LiveReactionType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reactions");
    };

    let reaction : LiveReaction = {
      sessionId;
      authorId = caller;
      reactionType;
      timestamp = Int.abs(Time.now());
    };

    switch (liveSessionReactions.get(sessionId)) {
      case (null) {
        let reactions = List.empty<LiveReaction>();
        reactions.add(reaction);
        liveSessionReactions.add(sessionId, reactions);
      };
      case (?reactions) {
        reactions.add(reaction);
      };
    };
  };

  public query func getSessionComments(sessionId : Nat) : async [LiveComment] {
    switch (liveSessionComments.get(sessionId)) {
      case (null) { [] };
      case (?comments) {
        comments.toArray().filter(func(c) { not c.isModerated });
      };
    };
  };

  public query func getSessionReactions(sessionId : Nat) : async [LiveReaction] {
    switch (liveSessionReactions.get(sessionId)) {
      case (null) { [] };
      case (?reactions) { reactions.toArray() };
    };
  };

  public shared ({ caller }) func incrementSessionViewers(sessionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can increment session viewers");
    };

    switch (liveSessions.get(sessionId)) {
      case (null) { Runtime.trap("Live session not found") };
      case (?session) {
        let newSession = { session with viewerCount = session.viewerCount + 1 };
        liveSessions.add(sessionId, newSession);
      };
    };
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
