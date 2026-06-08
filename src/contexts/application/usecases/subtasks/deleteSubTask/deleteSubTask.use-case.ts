import { Inject, Injectable } from '@nestjs/common';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { SubTaskRepository } from '@/contexts/domain/repositories/';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';

@Injectable()
export class DeleteSubTaskUseCase {

  // This constructor takes a subTaskRepository, taskRepository and activityLogRepository as dependencies
  constructor(
    @Inject('subTaskRepository') private subTaskRepository: SubTaskRepository,
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  // This function takes a subTaksId as a parameter and returns a successfully message
  async run(subTaskId: string): Promise<{message: string}> {

    // Get the subtask before deleting to capture task_id and createdBy for the activity log
    const subTask = await this.subTaskRepository.getSubTaskById(subTaskId);

    // Fetch parent task to get workspace_id for the activity log
    const parentTask = await this.taskRepository.getTaskById(subTask.task_id);

    // Call the repository method to delete a sub task
    await this.subTaskRepository.deleteSubTask(subTaskId);

    // Log the activity as fire-and-forget to avoid latency impact
    void this.activityLogRepository.logActivity(subTask.createdBy, parentTask.workspace_id, 'subtask:deleted');

    // Return a successfully message
    return {message: "Successfully Deleted Task"}

  }
}