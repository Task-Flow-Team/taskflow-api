import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { CommentRepository } from '@/contexts/domain/repositories/comment.repository.port';
import { Comment } from '@/contexts/domain/models/comment.entity';

@Injectable()
export class PrismaCommentRepository implements CommentRepository {
  constructor(private db: PrismaService) {}

  async createComment(userId: string, taskId: string, content: string): Promise<Comment> {
    return await this.db.comment.create({
      data: {
        user_id: userId,
        task_id: taskId,
        content,
      },
    });
  }

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const comment = await this.db.comment.findUnique({ where: { comment_id: commentId } });
    if (!comment) throw new NotFoundException(`Comment with ID ${commentId} not found`);
    return await this.db.comment.update({
      where: { comment_id: commentId },
      data: { content },
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    const comment = await this.db.comment.findUnique({ where: { comment_id: commentId } });
    if (!comment) throw new NotFoundException(`Comment with ID ${commentId} not found`);
    await this.db.comment.delete({ where: { comment_id: commentId } });
  }

  async getCommentsByTaskId(taskId: string): Promise<Comment[]> {
    return await this.db.comment.findMany({
      where: { task_id: taskId },
      orderBy: { created_at: 'desc' },
    });
  }

  async getCommentById(commentId: string): Promise<Comment> {
    const comment = await this.db.comment.findUnique({ where: { comment_id: commentId } });
    if (!comment) throw new NotFoundException(`Comment with ID ${commentId} not found`);
    return comment;
  }
}
