import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { TaskTags } from '@/contexts/domain/models/tags.entity';

@Injectable()
export class AddTagToTaskUseCase {
  constructor(
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  async run(userId: string, taskId: string, tagId: string): Promise<TaskTags> {
    const result = await this.taskRepository.addTagToTask(taskId, tagId);

    // Log activity — fire-and-forget
    void (async () => {
      try {
        const task = await this.taskRepository.getTaskById(taskId);
        if (task?.workspace_id) {
          void this.activityLogRepository.logActivity(userId, task.workspace_id, 'tag:added');
        }
      } catch (error) {
        console.error('[AddTagToTaskUseCase] Failed to log activity:', error);
      }
    })();

    return result;
  }
}
