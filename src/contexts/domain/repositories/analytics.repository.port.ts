import { OverdueTaskDto, WorkspaceSummaryDto } from '@/contexts/domain/models/analytics.entity';

export abstract class AnalyticsRepository {
  abstract getWorkspaceSummary(workspaceId: string): Promise<WorkspaceSummaryDto>;
  abstract getOverdueTasks(workspaceId: string): Promise<OverdueTaskDto[]>;
}
