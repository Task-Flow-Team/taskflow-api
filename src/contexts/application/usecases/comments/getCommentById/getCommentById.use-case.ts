import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@/contexts/domain/repositories/comment.repository.port';
import { Comment } from '@/contexts/domain/models/comment.entity';

@Injectable()
export class GetCommentByIdUseCase {
  constructor(@Inject('commentRepository') private commentRepository: CommentRepository) {}

  async run(commentId: string): Promise<Comment> {
    return await this.commentRepository.getCommentById(commentId);
  }
}
