import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { TaskTags } from '@/contexts/domain/models/tags.entity';

@Injectable()
export class AddTagToTaskUseCase {
  constructor(@Inject('taskRepository') private taskRepository: TaskRepository) {}

  async run(taskId: string, tagId: string): Promise<TaskTags> {
    return await this.taskRepository.addTagToTask(taskId, tagId);
  }
}
