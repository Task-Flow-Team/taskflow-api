import { Inject, Injectable } from '@nestjs/common';
import { TaskGroupRepository } from '@/contexts/domain/repositories/taskGroup.repository.port';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { TaskGroup } from '@/contexts/domain/models';

@Injectable()
export class CreateGroupUseCase {
  constructor(
    @Inject('taskGroupRepository') private taskGroupRepository: TaskGroupRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  async run(userId: string, workspaceId: string, name: string, color: string): Promise<TaskGroup> {
    const group = await this.taskGroupRepository.create(workspaceId, name, color);

    void this.activityLogRepository.logActivity(userId, workspaceId, 'group:created');

    return group;
  }
}
