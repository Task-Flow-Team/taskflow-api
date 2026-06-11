import { Inject, Injectable } from '@nestjs/common';
import { TaskGroupRepository } from '@/contexts/domain/repositories/taskGroup.repository.port';
import { TaskGroup } from '@/contexts/domain/models';

@Injectable()
export class GetGroupsByWorkspaceUseCase {
  constructor(
    @Inject('taskGroupRepository') private taskGroupRepository: TaskGroupRepository,
  ) {}

  async run(workspaceId: string): Promise<TaskGroup[]> {
    return this.taskGroupRepository.getByWorkspace(workspaceId);
  }
}
