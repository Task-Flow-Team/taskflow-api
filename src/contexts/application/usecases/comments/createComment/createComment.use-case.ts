import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@/contexts/domain/repositories/comment.repository.port';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { NotificationRepository } from '@/contexts/domain/repositories/notification.repository.port';
import { Comment } from '@/contexts/domain/models/comment.entity';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject('commentRepository') private commentRepository: CommentRepository,
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('notificationRepository') private notificationRepository: NotificationRepository,
  ) {}

  async run(userId: string, taskId: string, content: string): Promise<Comment> {
    const comment = await this.commentRepository.createComment(userId, taskId, content);

    // Fire-and-forget: notify assignee if the task has one and commenter is not the assignee
    void (async () => {
      try {
        const task = await this.taskRepository.getTaskById(taskId);
        if (task?.assignedTo && task.assignedTo !== userId) {
          void this.notificationRepository.create({
            userId: task.assignedTo,
            notification_type: 'task_commented',
            message: `New comment on your task: ${task.title}`,
          });
        }
      } catch (error) {
        console.error('[CreateCommentUseCase] Failed to send comment notification:', error);
      }
    })();

    return comment;
  }
}
