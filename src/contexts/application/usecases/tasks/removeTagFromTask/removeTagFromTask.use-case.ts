import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';

@Injectable()
export class RemoveTagFromTaskUseCase {
  constructor(
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  async run(userId: string, taskId: string, tagId: string): Promise<void> {
    await this.taskRepository.removeTagFromTask(taskId, tagId);

    // Log activity — fire-and-forget
    void (async () => {
      try {
        const task = await this.taskRepository.getTaskById(taskId);
        if (task?.workspace_id) {
          void this.activityLogRepository.logActivity(userId, task.workspace_id, 'tag:removed');
        }
      } catch (error) {
        console.error('[RemoveTagFromTaskUseCase] Failed to log activity:', error);
      }
    })();
  }
}
