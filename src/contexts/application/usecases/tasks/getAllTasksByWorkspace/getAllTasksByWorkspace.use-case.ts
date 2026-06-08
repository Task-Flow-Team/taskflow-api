import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { Task } from '@/contexts/domain/models';
import { FilterTasksDto } from '@/contexts/infrastructure/http-api/v1/tasks/dtos';
import { PaginatedResponse } from '@/contexts/shared/pagination.types';

@Injectable()
export class GetAllTasksByWorkspaceUseCase {

  // This constructor takes a taskRepository as a dependency
  constructor(@Inject('taskRepository') private taskRepository: TaskRepository) {}

  // This function takes a workspaceId and optional filters, returning a paginated response
  async run(workspaceId: string, filters?: FilterTasksDto): Promise<PaginatedResponse<Task>> {

    // Call the repository method to get all tasks in a specific workspace
    return await this.taskRepository.getAllTasksByWorkspaceId(workspaceId, filters);

  }
}
