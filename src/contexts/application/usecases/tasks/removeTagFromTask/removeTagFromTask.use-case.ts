import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';

@Injectable()
export class RemoveTagFromTaskUseCase {
  constructor(@Inject('taskRepository') private taskRepository: TaskRepository) {}

  async run(taskId: string, tagId: string): Promise<void> {
    return await this.taskRepository.removeTagFromTask(taskId, tagId);
  }
}
