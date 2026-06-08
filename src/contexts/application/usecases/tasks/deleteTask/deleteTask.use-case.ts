import { Inject, Injectable } from '@nestjs/common';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';

@Injectable()
export class DeleteTaskUseCase {

  // This constructor takes a taskRepository and activityLogRepository as dependencies
  constructor(
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  // This function takes a taskId and userId as parameters and returns a successfully message
  async run(taskId: string, userId: string): Promise<{message: string}> {

    // Get the task before deleting to capture workspace_id for the activity log
    const task = await this.taskRepository.getTaskById(taskId);

    // Call the repository method to delete a task
    await this.taskRepository.deleteTask(taskId);

    // Log the activity as fire-and-forget to avoid latency impact
    void this.activityLogRepository.logActivity(userId, task.workspace_id, 'task:deleted');

    // Return a successfully message
    return {message: "Successfully Deleted Task"}

  }
}