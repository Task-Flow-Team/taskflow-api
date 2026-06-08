import { Inject, Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '@/contexts/domain/repositories/analytics.repository.port';
import { OverdueTaskDto } from '@/contexts/domain/models/analytics.entity';

@Injectable()
export class GetOverdueTasksUseCase {
  constructor(
    @Inject('analyticsRepository') private analyticsRepository: AnalyticsRepository,
  ) {}

  async run(workspaceId: string): Promise<OverdueTaskDto[]> {
    return this.analyticsRepository.getOverdueTasks(workspaceId);
  }
}
