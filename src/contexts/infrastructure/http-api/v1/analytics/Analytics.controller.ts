import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, WorkspaceMemberGuard } from '@/contexts/shared/lib/guards';
import { GetWorkspaceSummaryUseCase } from '@/contexts/application/usecases/analytics/getWorkspaceSummary/getWorkspaceSummary.use-case';
import { GetOverdueTasksUseCase } from '@/contexts/application/usecases/analytics/getOverdueTasks/getOverdueTasks.use-case';
import { API_VERSION } from '@/contexts/infrastructure/http-api/v1/route.constants';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(`${API_VERSION}/analytics/workspace`)
export class AnalyticsController {
  constructor(
    private getWorkspaceSummaryUseCase: GetWorkspaceSummaryUseCase,
    private getOverdueTasksUseCase: GetOverdueTasksUseCase,
  ) {}

  @Get(':workspaceId/summary')
  @UseGuards(WorkspaceMemberGuard)
  async getSummary(@Param('workspaceId') workspaceId: string) {
    return this.getWorkspaceSummaryUseCase.run(workspaceId);
  }

  @Get(':workspaceId/overdue')
  @UseGuards(WorkspaceMemberGuard)
  async getOverdue(@Param('workspaceId') workspaceId: string) {
    return this.getOverdueTasksUseCase.run(workspaceId);
  }
}
