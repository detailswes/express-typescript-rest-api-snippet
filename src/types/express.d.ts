import type { IPost } from "../interfaces/PostInterface";
import type { IComment } from "../interfaces/CommentInterface";

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        email: string;
        iat?: number;
        exp?: number;
      };
      post?: IPost;
      comment?: IComment;
    }
  }
}

export {};
