import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";

module {
  type OldComment = {
    postId : Nat;
    author : Principal;
    content : Text;
    timestamp : Int;
  };

  type OldActor = {
    comments : Map.Map<Nat, List.List<OldComment>>;
  };

  type NewComment = {
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

  type NewActor = {
    comments : Map.Map<Nat, NewComment>;
  };

  func flattenAndMapComments(oldComments : Map.Map<Nat, List.List<OldComment>>) : Map.Map<Nat, NewComment> {
    let newComments = Map.empty<Nat, NewComment>();
    for ((postId, commentList) in oldComments.entries()) {
      for (oldComment in commentList.values()) {
        let newComment : NewComment = {
          id = postId;
          postId = postId.toText();
          authorId = oldComment.author;
          content = oldComment.content;
          createdAt = oldComment.timestamp;
          updatedAt = null;
          parentCommentId = null;
          likes = [];
          isDeleted = false;
        };
        newComments.add(postId, newComment);
      };
    };
    newComments;
  };

  public func run(old : OldActor) : NewActor {
    let mappedComments = flattenAndMapComments(old.comments);
    { comments = mappedComments };
  };
};
