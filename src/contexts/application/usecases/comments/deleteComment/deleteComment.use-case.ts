import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@/contexts/domain/repositories/comment.repository.port';

@Injectable()
export class DeleteCommentUseCase {
  constructor(@Inject('commentRepository') private commentRepository: CommentRepository) {}

  async run(commentId: string): Promise<void> {
    return await this.commentRepository.deleteComment(commentId);
  }
}
