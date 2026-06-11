import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { CommentRepository } from '@/contexts/domain/repositories/comment.repository.port';
import { Comment } from '@/contexts/domain/models/comment.entity';
import { PaginatedResponse, encodeCursor, decodeCursor } from '@/contexts/shared/pagination.types';

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

  async getCommentsByTaskId(taskId: string, cursor?: string, limit = 20): Promise<PaginatedResponse<Comment>> {
    const decodedCursor = cursor ? decodeCursor(cursor) : undefined;
    const [items, total] = await Promise.all([
      this.db.comment.findMany({
        where: { task_id: taskId },
        take: limit + 1,
        ...(decodedCursor && { cursor: { comment_id: decodedCursor }, skip: 1 }),
        orderBy: { created_at: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              profile_picture_url: true,
            },
          },
        },
      }),
      this.db.comment.count({ where: { task_id: taskId } }),
    ]);
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? encodeCursor(data[data.length - 1].comment_id) : null;
    return { data, nextCursor, total };
  }

  async getCommentById(commentId: string): Promise<Comment> {
    const comment = await this.db.comment.findUnique({ where: { comment_id: commentId } });
    if (!comment) throw new NotFoundException(`Comment with ID ${commentId} not found`);
    return comment;
  }
}
