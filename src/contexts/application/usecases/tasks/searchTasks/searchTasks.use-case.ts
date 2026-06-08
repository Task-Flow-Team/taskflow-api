import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { Task } from '@/contexts/domain/models';

@Injectable()
export class SearchTasksUseCase {
  constructor(@Inject('taskRepository') private taskRepository: TaskRepository) {}

  async run(workspaceId: string, q: string): Promise<Task[]> {
    if (!q || q.trim().length === 0) return [];
    return this.taskRepository.searchTasksByWorkspace(workspaceId, q.trim());
  }
}
