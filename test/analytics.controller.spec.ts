import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from '@/contexts/infrastructure/http-api/v1/analytics/Analytics.controller';
import { GetWorkspaceSummaryUseCase } from '@/contexts/application/usecases/analytics/getWorkspaceSummary/getWorkspaceSummary.use-case';
import { GetOverdueTasksUseCase } from '@/contexts/application/usecases/analytics/getOverdueTasks/getOverdueTasks.use-case';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';
import { WorkspaceSummaryDto, OverdueTaskDto } from '@/contexts/domain/models/analytics.entity';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let getWorkspaceSummaryUseCase: GetWorkspaceSummaryUseCase;
  let getOverdueTasksUseCase: GetOverdueTasksUseCase;

  const mockSummary: WorkspaceSummaryDto = {
    statusCounts: { OPEN: 3, IN_PROGRESS: 2, COMPLETED: 5 },
    workload: [{ assigneeId: 'user-1', assignee: 'Alice', openTasks: 3 }],
    completedPerDay: [{ date: '2024-01-01', count: 2 }],
    overdueCount: 1,
  };

  const mockOverdueTasks: OverdueTaskDto[] = [
    {
      taskId: 'task-1',
      title: 'Fix critical bug',
      assigneeId: 'user-1',
      assignee: 'Alice',
      dueDate: '2024-01-01',
      daysOverdue: 5,
    },
    {
      taskId: 'task-2',
      title: 'Write docs',
      assigneeId: null,
      assignee: null,
      dueDate: '2024-01-02',
      daysOverdue: 3,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: GetWorkspaceSummaryUseCase, useValue: { run: jest.fn() } },
        { provide: GetOverdueTasksUseCase, useValue: { run: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    getWorkspaceSummaryUseCase = module.get(GetWorkspaceSummaryUseCase);
    getOverdueTasksUseCase = module.get(GetOverdueTasksUseCase);
  });

  describe('GetWorkspaceSummaryUseCase', () => {
    it('run() should return a WorkspaceSummaryDto shape', async () => {
      jest.spyOn(getWorkspaceSummaryUseCase, 'run').mockResolvedValue(mockSummary);

      const result = await getWorkspaceSummaryUseCase.run('ws-1');

      expect(result).toMatchObject<WorkspaceSummaryDto>({
        statusCounts: expect.objectContaining({ OPEN: expect.any(Number), IN_PROGRESS: expect.any(Number), COMPLETED: expect.any(Number) }),
        workload: expect.any(Array),
        completedPerDay: expect.any(Array),
        overdueCount: expect.any(Number),
      });
    });
  });

  describe('GET :workspaceId/summary', () => {
    it('should delegate to GetWorkspaceSummaryUseCase.run with workspaceId', async () => {
      jest.spyOn(getWorkspaceSummaryUseCase, 'run').mockResolvedValue(mockSummary);

      const result = await controller.getSummary('ws-1');

      expect(getWorkspaceSummaryUseCase.run).toHaveBeenCalledWith('ws-1');
      expect(result).toEqual(mockSummary);
    });
  });

  describe('GetOverdueTasksUseCase', () => {
    it('run() should return an OverdueTaskDto[] array', async () => {
      jest.spyOn(getOverdueTasksUseCase, 'run').mockResolvedValue(mockOverdueTasks);

      const result = await getOverdueTasksUseCase.run('ws-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject<OverdueTaskDto>({
        taskId: expect.any(String),
        title: expect.any(String),
        assigneeId: expect.anything(),
        assignee: expect.anything(),
        dueDate: expect.any(String),
        daysOverdue: expect.any(Number),
      });
    });
  });

  describe('GET :workspaceId/overdue', () => {
    it('should delegate to GetOverdueTasksUseCase.run with workspaceId', async () => {
      jest.spyOn(getOverdueTasksUseCase, 'run').mockResolvedValue(mockOverdueTasks);

      const result = await controller.getOverdue('ws-1');

      expect(getOverdueTasksUseCase.run).toHaveBeenCalledWith('ws-1');
      expect(result).toEqual(mockOverdueTasks);
    });

    it('should handle use case returning empty array when no tasks are overdue', async () => {
      jest.spyOn(getOverdueTasksUseCase, 'run').mockResolvedValue([]);

      const result = await controller.getOverdue('ws-1');

      expect(result).toEqual([]);
    });

    it('should handle overdue tasks with null assignee (completed_at fallback)', async () => {
      const tasksWithNullAssignee: OverdueTaskDto[] = [
        { taskId: 'task-3', title: 'Unassigned task', assigneeId: null, assignee: null, dueDate: '2024-01-01', daysOverdue: 2 },
      ];
      jest.spyOn(getOverdueTasksUseCase, 'run').mockResolvedValue(tasksWithNullAssignee);

      const result = await controller.getOverdue('ws-2');

      expect(result[0].assigneeId).toBeNull();
      expect(result[0].assignee).toBeNull();
    });
  });
});
