import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@/contexts/domain/repositories/comment.repository.port';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    @Inject('commentRepository') private commentRepository: CommentRepository,
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  async run(userId: string, taskId: string, commentId: string): Promise<void> {
    await this.commentRepository.deleteComment(commentId);

    // Log activity — fire-and-forget
    void (async () => {
      try {
        const task = await this.taskRepository.getTaskById(taskId);
        if (task?.workspace_id) {
          void this.activityLogRepository.logActivity(userId, task.workspace_id, 'comment:deleted');
        }
      } catch (error) {
        console.error('[DeleteCommentUseCase] Failed to log activity:', error);
      }
    })();
  }
}
