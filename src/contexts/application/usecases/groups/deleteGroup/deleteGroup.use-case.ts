import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TaskGroupRepository } from '@/contexts/domain/repositories/taskGroup.repository.port';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';

@Injectable()
export class DeleteGroupUseCase {
  constructor(
    @Inject('taskGroupRepository') private taskGroupRepository: TaskGroupRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  async run(userId: string, groupId: string): Promise<void> {
    const group = await this.taskGroupRepository.getById(groupId);
    if (!group) throw new NotFoundException(`Group with ID ${groupId} not found`);

    await this.taskGroupRepository.delete(groupId);

    void this.activityLogRepository.logActivity(userId, group.workspace_id, 'group:deleted');
  }
}
