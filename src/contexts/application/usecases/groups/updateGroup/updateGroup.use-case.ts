import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TaskGroupRepository } from '@/contexts/domain/repositories/taskGroup.repository.port';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { TaskGroup } from '@/contexts/domain/models';

@Injectable()
export class UpdateGroupUseCase {
  constructor(
    @Inject('taskGroupRepository') private taskGroupRepository: TaskGroupRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  async run(userId: string, groupId: string, data: Partial<TaskGroup>): Promise<TaskGroup> {
    const group = await this.taskGroupRepository.getById(groupId);
    if (!group) throw new NotFoundException(`Group with ID ${groupId} not found`);

    const updatedGroup = await this.taskGroupRepository.update(groupId, data);

    void this.activityLogRepository.logActivity(userId, group.workspace_id, 'group:updated');

    return updatedGroup;
  }
}
