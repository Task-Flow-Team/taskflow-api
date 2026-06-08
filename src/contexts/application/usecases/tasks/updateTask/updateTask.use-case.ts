import { Inject, Injectable } from '@nestjs/common';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { Task } from '@/contexts/domain/models';

@Injectable()
export class UpdateTaskUseCase {

  // This constructor takes a taskRepository and activityLogRepository as dependencies
  constructor(
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  // This function takes a taksId as a parameter and returns the task updated
  async run(userId: string, taskId: string, task: Partial<Task>): Promise<Task> {

    // Call the repository method to update a task
    const updatedTask = await this.taskRepository.updateTask(userId, taskId, task);

    // Log the activity as fire-and-forget to avoid latency impact
    void this.activityLogRepository.logActivity(userId, updatedTask.workspace_id, 'task:updated');

    return updatedTask;

  }
}