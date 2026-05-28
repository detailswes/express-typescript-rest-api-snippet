import { body, param } from "express-validator";

export class PostValidators {
  static addPost() {
    return [body("content", "Post content is required").isString()];
  }

  static postIdParam() {
    return [param("id", "Post ID is required").isMongoId()];
  }

  static editPost() {
    return [
      param("id", "Post ID is required").isMongoId(),
      body("content", "Content is required").isString(),
    ];
  }
}
