import { body, param } from "express-validator";

export class CommentValidators {
  static addComment() {
    return [
      param("postId", "Post ID is required").isMongoId(),
      body("content", "Comment content is required").isString(),
    ];
  }

  static editComment() {
    return [
      param("id", "Comment ID is required").isMongoId(),
      body("content", "Content is required").isString(),
    ];
  }

  static commentIdParam() {
    return [param("id", "Comment ID is required").isMongoId()];
  }
}
