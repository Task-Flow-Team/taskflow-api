import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@/contexts/domain/repositories/comment.repository.port';
import { Comment } from '@/contexts/domain/models/comment.entity';

@Injectable()
export class CreateCommentUseCase {
  constructor(@Inject('commentRepository') private commentRepository: CommentRepository) {}

  async run(userId: string, taskId: string, content: string): Promise<Comment> {
    return await this.commentRepository.createComment(userId, taskId, content);
  }
}
