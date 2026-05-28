import { IPost } from "../interfaces/PostInterface";
import { PostRepository } from "../repositories/post.repository";
import { assertPostOwnership } from "../utils/authorization";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class PostService {
  static async createPost(userId: string, content: string): Promise<IPost> {
    return PostRepository.create(userId, content);
  }

  static async getPostsByUser(
    userId: string,
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT
  ) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);

    const { posts, total } = await PostRepository.findByUserPaginated(
      userId,
      safePage,
      safeLimit
    );

    return {
      data: posts,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  static getPostById(post: IPost) {
    return {
      post,
      comment_counts: post.commentCount,
    };
  }

  static async editPost(
    post: IPost,
    userId: string,
    content: string
  ): Promise<IPost> {
    assertPostOwnership(post, userId);
    return PostRepository.updateDocument(post, content);
  }

  static async deletePost(post: IPost, userId: string) {
    assertPostOwnership(post, userId);
    await PostRepository.deleteDocument(post);
    return { message: "Post deleted successfully", id: post._id };
  }
}
