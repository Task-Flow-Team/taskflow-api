import { Inject, Injectable } from '@nestjs/common';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { SubTaskRepository } from '@/contexts/domain/repositories';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { SubTask } from '@/contexts/domain/models';

@Injectable()
export class CreateSubTaskUseCase {

  // This constructor takes a subTaskRepository, taskRepository and activityLogRepository as dependencies
  constructor(
    @Inject('subTaskRepository') private subTaskRepository: SubTaskRepository,
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  // This function takes a userId as a parameter and a partial subtask object, after returns the subtask created
  async run(userId: string, subtask: Partial<SubTask>): Promise<SubTask> {

    // Call the repository method to create a subtask and get the all object already created
    const createdSubTask = await this.subTaskRepository.createSubTask(userId, subtask);

    // Fetch parent task to get workspace_id for the activity log
    const parentTask = await this.taskRepository.getTaskById(createdSubTask.task_id);

    // Log the activity as fire-and-forget to avoid latency impact
    void this.activityLogRepository.logActivity(userId, parentTask.workspace_id, 'subtask:created');

    return createdSubTask;

  }
}