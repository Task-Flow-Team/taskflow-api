import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@/contexts/domain/repositories/comment.repository.port';
import { Comment } from '@/contexts/domain/models/comment.entity';
import { PaginatedResponse } from '@/contexts/shared/pagination.types';

@Injectable()
export class GetCommentsByTaskUseCase {
  constructor(@Inject('commentRepository') private commentRepository: CommentRepository) {}

  async run(taskId: string, cursor?: string, limit = 20): Promise<PaginatedResponse<Comment>> {
    return await this.commentRepository.getCommentsByTaskId(taskId, cursor, limit);
  }
}
