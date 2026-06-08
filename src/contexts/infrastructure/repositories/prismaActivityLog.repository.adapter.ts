import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { ActivityLog } from '@/contexts/domain/models/activityLog.entity';

@Injectable()
export class PrismaActivityLogRepository implements ActivityLogRepository {
  constructor(private db: PrismaService) {}

  async logActivity(userId: string, workspaceId: string, action: string): Promise<ActivityLog> {
    return await this.db.activityLogs.create({
      data: {
        user_id: userId,
        workspace_id: workspaceId,
        action,
        timestamp: new Date(),
      },
    });
  }

  async getActivityByWorkspace(workspaceId: string): Promise<ActivityLog[]> {
    return await this.db.activityLogs.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
