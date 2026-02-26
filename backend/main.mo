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
import Migration "migration";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
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

  // --- Location API Functions ---
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

  // Location Models
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

  // Location Constants
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

  // Helper function to check if user is verified
  func isUserVerified(user : Principal) : Bool {
    switch (verifiedUsers.get(user)) {
      case (?verifiedUser) { verifiedUser.isVerified };
      case null { false };
    };
  };

  // --- Comment Functions ---

  public shared ({ caller }) func addComment(
    postId : Text,
    content : Text,
    parentCommentId : ?Nat,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can add comments");
    };

    let trimmedContent = content.trim(#char(' '));
    if (trimmedContent.size() == 0) {
      Runtime.trap("Comment content cannot be empty");
    };

    let newComment : Comment = {
      id = commentCounter;
      postId;
      authorId = caller;
      content = trimmedContent;
      createdAt = Time.now();
      updatedAt = null;
      parentCommentId;
      likes = [];
      isDeleted = false;
    };

    comments.add(commentCounter, newComment);
    commentCounter += 1;
    newComment.id;
  };

  public query ({ caller }) func getCommentsByPost(postId : Text) : async [Comment] {
    let allComments = comments.values().toArray();
    allComments.filter(
      func(c) {
        c.postId == postId and not c.isDeleted;
      }
    );
  };

  public shared ({ caller }) func editComment(commentId : Nat, newContent : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can edit comments");
    };

    switch (comments.get(commentId)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) {
        if (comment.authorId != caller) {
          Runtime.trap("Unauthorized: Only the author can edit this comment");
        };

        let trimmedContent = newContent.trim(#char(' '));
        if (trimmedContent.size() == 0) {
          Runtime.trap("Comment content cannot be empty");
        };

        let updatedComment : Comment = {
          id = comment.id;
          postId = comment.postId;
          authorId = comment.authorId;
          content = trimmedContent;
          createdAt = comment.createdAt;
          updatedAt = ?Time.now();
          parentCommentId = comment.parentCommentId;
          likes = comment.likes;
          isDeleted = comment.isDeleted;
        };

        comments.add(commentId, updatedComment);
      };
    };
  };

  public shared ({ caller }) func deleteComment(commentId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can delete comments");
    };

    switch (comments.get(commentId)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) {
        if (comment.authorId != caller) {
          Runtime.trap("Unauthorized: Only the author can delete this comment");
        };

        let updatedComment : Comment = {
          id = comment.id;
          postId = comment.postId;
          authorId = comment.authorId;
          content = comment.content;
          createdAt = comment.createdAt;
          updatedAt = comment.updatedAt;
          parentCommentId = comment.parentCommentId;
          likes = comment.likes;
          isDeleted = true;
        };

        comments.add(commentId, updatedComment);
      };
    };
  };

  public shared ({ caller }) func likeComment(commentId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can like comments");
    };

    switch (comments.get(commentId)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) {
        let hasLiked = comment.likes.any(func(l) { l == caller });
        let updatedLikes = if (hasLiked) {
          comment.likes.filter(func(l) { l != caller });
        } else {
          comment.likes.concat([caller]);
        };

        let updatedComment : Comment = {
          id = comment.id;
          postId = comment.postId;
          authorId = comment.authorId;
          content = comment.content;
          createdAt = comment.createdAt;
          updatedAt = comment.updatedAt;
          parentCommentId = comment.parentCommentId;
          likes = updatedLikes;
          isDeleted = comment.isDeleted;
        };

        comments.add(commentId, updatedComment);
      };
    };
  };

  public query ({ caller }) func getCommentLikeCount(commentId : Nat) : async Nat {
    switch (comments.get(commentId)) {
      case (null) { 0 };
      case (?comment) { comment.likes.size() };
    };
  };

  // --- Post Functions ---

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
    let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
    let isVerified = isUserVerified(caller);
    if (not isAdminUser and not isVerified) {
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
        let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
        if (not isOwner and not isAdminUser) {
          Runtime.trap("Unauthorized: Only the post owner or admin can delete this post");
        };
        posts.remove(postId);
        postLikes.remove(postId);
      };
    };
  };

  public query ({ caller }) func getPosts() : async [Post] {
    posts.values().toArray();
  };

  public query ({ caller }) func getPost(postId : Nat) : async ?Post {
    posts.get(postId);
  };

  // Like a post (toggle like on). Returns updated like count.
  public shared ({ caller }) func likePost(postId : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can like posts");
    };
    switch (posts.get(postId)) {
      case null {
        Runtime.trap("Post not found");
      };
      case (?post) {
        let likesSet = switch (postLikes.get(postId)) {
          case (?s) { s };
          case null { Set.empty<Principal>() };
        };
        if (likesSet.contains(caller)) {
          // Already liked, return current count
          post.likeCount;
        } else {
          likesSet.add(caller);
          postLikes.add(postId, likesSet);
          let newCount = post.likeCount + 1;
          let updatedPost : Post = {
            id = post.id;
            author = post.author;
            content = post.content;
            timestamp = post.timestamp;
            likeCount = newCount;
            seriousLikeCount = post.seriousLikeCount;
            groupId = post.groupId;
            postType = post.postType;
          };
          posts.add(postId, updatedPost);
          newCount;
        };
      };
    };
  };

  // Unlike a post. Returns updated like count.
  public shared ({ caller }) func unlikePost(postId : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can unlike posts");
    };
    switch (posts.get(postId)) {
      case null {
        Runtime.trap("Post not found");
      };
      case (?post) {
        let likesSet = switch (postLikes.get(postId)) {
          case (?s) { s };
          case null { Set.empty<Principal>() };
        };
        if (not likesSet.contains(caller)) {
          // Not liked, return current count
          post.likeCount;
        } else {
          likesSet.remove(caller);
          postLikes.add(postId, likesSet);
          let newCount = if (post.likeCount > 0) {
            post.likeCount - 1;
          } else { 0 };
          let updatedPost : Post = {
            id = post.id;
            author = post.author;
            content = post.content;
            timestamp = post.timestamp;
            likeCount = newCount;
            seriousLikeCount = post.seriousLikeCount;
            groupId = post.groupId;
            postType = post.postType;
          };
          posts.add(postId, updatedPost);
          newCount;
        };
      };
    };
  };

  // Check if caller has liked a post
  public query ({ caller }) func hasLikedPost(postId : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can check likes");
    };
    switch (postLikes.get(postId)) {
      case null { false };
      case (?likesSet) { likesSet.contains(caller) };
    };
  };

  // --- Poll Functions ---

  public shared ({ caller }) func createPoll(
    question : Text,
    options : [Text],
    isPublic : Bool,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can create polls");
    };
    let trimmedQuestion = question.trim(#char(' '));
    if (trimmedQuestion.size() == 0) {
      Runtime.trap("Poll question cannot be empty");
    };
    if (options.size() < 2) {
      Runtime.trap("Poll must have at least 2 options");
    };
    // Validate each option is non-empty
    for (opt in options.vals()) {
      let trimmed = opt.trim(#char(' '));
      if (trimmed.size() == 0) {
        Runtime.trap("Poll options cannot be empty");
      };
    };
    let pollId = pollCounter;
    pollCounter += 1;
    // Initialize votes array with zeros
    let votes = Array.tabulate(options.size(), func(_i) { 0 });
    let newPoll : Poll = {
      id = pollId;
      question = trimmedQuestion;
      options;
      votes;
      isPublic;
      creator = caller;
    };
    polls.add(pollId, newPoll);
    pollId;
  };

  public query ({ caller }) func getPolls() : async [Poll] {
    let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);
    let all = polls.values().toArray();
    // Public polls visible to all; private polls visible only to creator or admin
    all.filter(func(poll) {
      if (poll.isPublic) { true } else {
        isAdminUser or (isUser and poll.creator == caller);
      };
    });
  };

  public query ({ caller }) func getPoll(pollId : Nat) : async ?Poll {
    switch (polls.get(pollId)) {
      case null { null };
      case (?poll) {
        if (poll.isPublic) {
          ?poll;
        } else {
          let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
          let isCreator = AccessControl.hasPermission(
            accessControlState,
            caller,
            #user,
          ) and poll.creator == caller;
          if (isAdminUser or isCreator) { ?poll } else { null };
        };
      };
    };
  };

  // Vote on a poll. A user can only vote once per poll.
  public shared ({ caller }) func votePoll(
    pollId : Nat,
    optionIndex : Nat,
  ) : async Poll {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can vote on polls");
    };
    switch (polls.get(pollId)) {
      case null {
        Runtime.trap("Poll not found");
      };
      case (?poll) {
        if (optionIndex >= poll.options.size()) {
          Runtime.trap("Invalid option index");
        };
        // Check if user has already voted
        let responses = switch (pollResponses.get(pollId)) {
          case (?r) { r };
          case null { List.empty<PollResponse>() };
        };
        let alreadyVoted = responses.toArray().filter(
          func(r : PollResponse) : Bool { r.user == caller },
        ).size() > 0;
        if (alreadyVoted) {
          Runtime.trap("User has already voted on this poll");
        };
        // Record the response
        let newResponse : PollResponse = {
          pollId;
          user = caller;
          selectedOption = optionIndex;
        };
        responses.add(newResponse);
        pollResponses.add(pollId, responses);
        // Update vote count
        let newVotes = Array.tabulate(poll.votes.size(), func(i) {
          if (i == optionIndex) { poll.votes[i] + 1 } else { poll.votes[i] };
        });
        let updatedPoll : Poll = {
          id = poll.id;
          question = poll.question;
          options = poll.options;
          votes = newVotes;
          isPublic = poll.isPublic;
          creator = poll.creator;
        };
        polls.add(pollId, updatedPoll);
        updatedPoll;
      };
    };
  };

  // Check if caller has voted on a poll
  public query ({ caller }) func hasVotedOnPoll(pollId : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can check votes");
    };
    switch (pollResponses.get(pollId)) {
      case null { false };
      case (?responses) {
        responses.toArray().filter(
          func(r : PollResponse) : Bool { r.user == caller },
        ).size() > 0;
      };
    };
  };

  // --- Group Functions ---

  public shared ({ caller }) func createGroup(
    name : Text,
    description : Text,
    coverImage : ?Storage.ExternalBlob,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can create groups");
    };
    let trimmedName = name.trim(#char(' '));
    if (trimmedName.size() == 0) {
      Runtime.trap("Group name cannot be empty");
    };
    let groupId = groupCounter;
    groupCounter += 1;
    let newGroup : Group = {
      id = groupId;
      name = trimmedName;
      description;
      creator = caller;
      coverImage;
      createdAt = Time.now();
    };
    groups.add(groupId, newGroup);
    // Automatically add creator as a member
    let memberships = switch (groupMemberships.get(groupId)) {
      case (?m) { m };
      case null { List.empty<GroupMembership>() };
    };
    let creatorMembership : GroupMembership = {
      groupId;
      user = caller;
      joinedAt = Time.now();
    };
    memberships.add(creatorMembership);
    groupMemberships.add(groupId, memberships);
    groupId;
  };

  public query ({ caller }) func getGroups() : async [Group] {
    groups.values().toArray();
  };

  public query ({ caller }) func getGroup(groupId : Nat) : async ?Group {
    groups.get(groupId);
  };

  public shared ({ caller }) func joinGroup(groupId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can join groups");
    };
    switch (groups.get(groupId)) {
      case null { Runtime.trap("Group not found") };
      case (?_group) {
        let memberships = switch (groupMemberships.get(groupId)) {
          case (?m) { m };
          case null { List.empty<GroupMembership>() };
        };
        let alreadyMember = memberships.toArray().filter(
          func(m : GroupMembership) : Bool { m.user == caller },
        ).size() > 0;
        if (alreadyMember) {
          Runtime.trap("User is already a member of this group");
        };
        let newMembership : GroupMembership = {
          groupId;
          user = caller;
          joinedAt = Time.now();
        };
        memberships.add(newMembership);
        groupMemberships.add(groupId, memberships);
      };
    };
  };

  public shared ({ caller }) func leaveGroup(groupId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can leave groups");
    };
    switch (groups.get(groupId)) {
      case null { Runtime.trap("Group not found") };
      case (?group) {
        if (group.creator == caller) {
          Runtime.trap("Group creator cannot leave the group");
        };
        switch (groupMemberships.get(groupId)) {
          case null { Runtime.trap("User is not a member of this group") };
          case (?memberships) {
            let filtered = List.fromArray<GroupMembership>(
              memberships.toArray().filter(
                func(m : GroupMembership) : Bool { m.user != caller }
              )
            );
            groupMemberships.add(groupId, filtered);
          };
        };
      };
    };
  };

  public query ({ caller }) func getGroupMembers(groupId : Nat) : async [GroupMembership] {
    switch (groupMemberships.get(groupId)) {
      case null { [] };
      case (?memberships) { memberships.toArray() };
    };
  };

  public shared ({ caller }) func deleteGroup(groupId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can delete groups");
    };
    switch (groups.get(groupId)) {
      case null { Runtime.trap("Group not found") };
      case (?group) {
        let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
        if (group.creator != caller and not isAdminUser) {
          Runtime.trap("Unauthorized: Only the group creator or admin can delete this group");
        };
        groups.remove(groupId);
        groupMemberships.remove(groupId);
      };
    };
  };

  // --- Page Functions ---

  public shared ({ caller }) func createPage(
    pageName : Text,
    category : Text,
    description : Text,
    profileImage : ?Storage.ExternalBlob,
    isPrivate : Bool,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create pages");
    };
    let trimmedName = pageName.trim(#char(' '));
    if (trimmedName.size() == 0) {
      Runtime.trap("Page name cannot be empty");
    };
    let pageId = pageCounter;
    pageCounter += 1;
    let newPage : Page = {
      pageName = trimmedName;
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

  public query ({ caller }) func getAllPages() : async [Page] {
    let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
    let all = pages.values().toArray();
    let filtered = all.filter(
      func(page) {
        if (not page.isPrivate) {
          true;
        } else {
          isAdminUser or page.owner == caller;
        };
      }
    );
    filtered;
  };

  public query ({ caller }) func getUserPages(user : Principal) : async [Page] {
    let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
    let isOwner = caller == user;
    let all = pages.values().toArray();
    let filtered = all.filter(
      func(page) {
        if (page.owner != user) {
          false;
        } else if (not page.isPrivate) {
          true;
        } else {
          isAdminUser or isOwner;
        };
      }
    );
    filtered;
  };

  // --- User Profile Functions ---

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // --- Wallet Functions ---

  public query ({ caller }) func getWallet(user : Principal) : async ?Wallet {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own wallet");
    };
    wallets.get(user);
  };

  public query ({ caller }) func getCallerWallet() : async ?Wallet {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access wallets");
    };
    wallets.get(caller);
  };

  public query ({ caller }) func getPointHistory(user : Principal) : async [PointHistory] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own point history");
    };
    switch (pointHistories.get(user)) {
      case (null) { [] };
      case (?history) { history.toArray() };
    };
  };

  public query ({ caller }) func getCallerPointHistory() : async [PointHistory] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access point history");
    };
    switch (pointHistories.get(caller)) {
      case (null) { [] };
      case (?history) { history.toArray() };
    };
  };

  // --- Location Functions ---

  public query ({ caller }) func getCountries() : async [Text] {
    ["IN"];
  };

  public query ({ caller }) func getStatesByCountry(_country : Text) : async [Text] {
    [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim"
    ];
  };

  public query ({ caller }) func getDistrictsByState(state : Text) : async [Text] {
    if (state == "Tamil Nadu") {
      return [
        "Ariyalur",
        "Chengalpattu",
        "Chennai",
        "Coimbatore",
        "Cuddalore",
        "Dharmapuri",
        "Dindigul",
        "Erode"
      ];
    } else {
      return [];
    };
  };

  // --- Helper Functions ---

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
