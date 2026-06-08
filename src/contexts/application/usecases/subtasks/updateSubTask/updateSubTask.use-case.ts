import { Inject, Injectable } from '@nestjs/common';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { SubTaskRepository } from '@/contexts/domain/repositories';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { SubTask } from '@/contexts/domain/models';

@Injectable()
export class UpdateSubTaskUseCase {

  // This constructor takes a subTaskRepository, taskRepository and activityLogRepository as dependencies
  constructor(
    @Inject('subTaskRepository') private subTaskRepository: SubTaskRepository,
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  // This function takes a userId, subTaskId and subTask as parameters and returns the sub task updated
  async run(userId: string, subTaskId: string, subTask: Partial<SubTask>): Promise<SubTask> {

    // Call the repository method to update a sub task
    const updatedSubTask = await this.subTaskRepository.updateSubTask(subTaskId, subTask);

    // Fetch parent task to get workspace_id for the activity log
    const parentTask = await this.taskRepository.getTaskById(updatedSubTask.task_id);

    // Log the activity as fire-and-forget to avoid latency impact
    void this.activityLogRepository.logActivity(userId, parentTask.workspace_id, 'subtask:updated');

    return updatedSubTask;

  }
}