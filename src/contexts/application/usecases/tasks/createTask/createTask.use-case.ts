import { Inject, Injectable } from '@nestjs/common';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { CreateTaskBody, Task } from '@/contexts/domain/models';

@Injectable()
export class CreateTaskUseCase {

  // This constructor takes a taskRepository and activityLogRepository as dependencies
  constructor(
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  // This function takes a userId as a parameter and a partial task object, after returns the task created
  async run(userId: string, task: CreateTaskBody): Promise<Task> {

    // Call the repository method to create a task and get the all object already created
    const createdTask = await this.taskRepository.createTask(userId, task);

    // Log the activity as fire-and-forget to avoid latency impact
    void this.activityLogRepository.logActivity(userId, createdTask.workspace_id, 'task:created');

    return createdTask;

  }
}