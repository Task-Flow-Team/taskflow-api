import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@/contexts/domain/repositories/comment.repository.port';
import { Comment } from '@/contexts/domain/models/comment.entity';

@Injectable()
export class GetCommentsByTaskUseCase {
  constructor(@Inject('commentRepository') private commentRepository: CommentRepository) {}

  async run(taskId: string): Promise<Comment[]> {
    return await this.commentRepository.getCommentsByTaskId(taskId);
  }
}
