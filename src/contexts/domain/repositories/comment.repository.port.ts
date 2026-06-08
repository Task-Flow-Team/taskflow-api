import { Comment } from '@/contexts/domain/models/comment.entity';
import { PaginatedResponse } from '@/contexts/shared/pagination.types';

export abstract class CommentRepository {
  abstract createComment(userId: string, taskId: string, content: string): Promise<Comment>;
  abstract updateComment(commentId: string, content: string): Promise<Comment>;
  abstract deleteComment(commentId: string): Promise<void>;
  abstract getCommentsByTaskId(taskId: string, cursor?: string, limit?: number): Promise<PaginatedResponse<Comment>>;
  abstract getCommentById(commentId: string): Promise<Comment>;
}
