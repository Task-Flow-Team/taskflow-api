import { Inject, Injectable } from '@nestjs/common';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { ActivityLog } from '@/contexts/domain/models/activityLog.entity';

@Injectable()
export class GetActivityByWorkspaceUseCase {

  constructor(@Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository) {}

  async run(workspaceId: string): Promise<ActivityLog[]> {
    return await this.activityLogRepository.getActivityByWorkspace(workspaceId);
  }
}
