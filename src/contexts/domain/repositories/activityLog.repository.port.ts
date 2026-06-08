import { ActivityLog } from '@/contexts/domain/models/activityLog.entity';

export abstract class ActivityLogRepository {
  abstract logActivity(userId: string, workspaceId: string, action: string): Promise<ActivityLog>;
  abstract getActivityByWorkspace(workspaceId: string): Promise<ActivityLog[]>;
}
