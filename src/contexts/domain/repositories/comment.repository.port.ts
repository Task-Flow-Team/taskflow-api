import { Comment } from '@/contexts/domain/models/comment.entity';

export abstract class CommentRepository {
  abstract createComment(userId: string, taskId: string, content: string): Promise<Comment>;
  abstract updateComment(commentId: string, content: string): Promise<Comment>;
  abstract deleteComment(commentId: string): Promise<void>;
  abstract getCommentsByTaskId(taskId: string): Promise<Comment[]>;
  abstract getCommentById(commentId: string): Promise<Comment>;
}
