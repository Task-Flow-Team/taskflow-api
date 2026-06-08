import { Inject, Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '@/contexts/domain/repositories/analytics.repository.port';
import { WorkspaceSummaryDto } from '@/contexts/domain/models/analytics.entity';

@Injectable()
export class GetWorkspaceSummaryUseCase {
  constructor(
    @Inject('analyticsRepository') private analyticsRepository: AnalyticsRepository,
  ) {}

  async run(workspaceId: string): Promise<WorkspaceSummaryDto> {
    return this.analyticsRepository.getWorkspaceSummary(workspaceId);
  }
}
