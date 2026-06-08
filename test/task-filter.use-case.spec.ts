import { Test, TestingModule } from '@nestjs/testing';
import { GetAllTasksByWorkspaceUseCase } from '@/contexts/application/usecases/tasks/getAllTasksByWorkspace/getAllTasksByWorkspace.use-case';
import { SearchTasksUseCase } from '@/contexts/application/usecases/tasks/searchTasks/searchTasks.use-case';
import { PaginatedResponse } from '@/contexts/shared/pagination.types';

describe('GetAllTasksByWorkspaceUseCase', () => {
  let useCase: GetAllTasksByWorkspaceUseCase;

  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    workspace_id: 'ws-1',
    status: 'OPEN',
    priority: 1,
    assignedTo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResponse: PaginatedResponse<any> = {
    data: [mockTask],
    nextCursor: null,
    total: 1,
  };

  const mockTaskRepository = {
    getAllTasksByWorkspaceId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllTasksByWorkspaceUseCase,
        { provide: 'taskRepository', useValue: mockTaskRepository },
      ],
    }).compile();

    useCase = module.get<GetAllTasksByWorkspaceUseCase>(GetAllTasksByWorkspaceUseCase);
  });

  describe('run()', () => {
    it('calls repository with empty filters and returns PaginatedResponse when no filters provided', async () => {
      mockTaskRepository.getAllTasksByWorkspaceId.mockResolvedValue(mockPaginatedResponse);

      const result = await useCase.run('ws-1');

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockTaskRepository.getAllTasksByWorkspaceId).toHaveBeenCalledWith('ws-1', undefined);
    });

    it('calls repository with status filter when status is provided', async () => {
      mockTaskRepository.getAllTasksByWorkspaceId.mockResolvedValue(mockPaginatedResponse);

      const filters = { status: 'OPEN' };
      const result = await useCase.run('ws-1', filters as any);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockTaskRepository.getAllTasksByWorkspaceId).toHaveBeenCalledWith('ws-1', { status: 'OPEN' });
    });

    it('calls repository with all provided filter values when multiple filters given', async () => {
      mockTaskRepository.getAllTasksByWorkspaceId.mockResolvedValue(mockPaginatedResponse);

      const filters = {
        status: 'IN_PROGRESS',
        priority: 2,
        assignedTo: 'user-1',
      };
      const result = await useCase.run('ws-1', filters as any);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockTaskRepository.getAllTasksByWorkspaceId).toHaveBeenCalledWith('ws-1', {
        status: 'IN_PROGRESS',
        priority: 2,
        assignedTo: 'user-1',
      });
    });
  });
});

describe('SearchTasksUseCase', () => {
  let useCase: SearchTasksUseCase;

  const mockTasks = [
    {
      id: 'task-1',
      title: 'Search result',
      workspace_id: 'ws-1',
      status: 'OPEN',
      priority: 1,
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTaskRepository = {
    searchTasksByWorkspace: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchTasksUseCase,
        { provide: 'taskRepository', useValue: mockTaskRepository },
      ],
    }).compile();

    useCase = module.get<SearchTasksUseCase>(SearchTasksUseCase);
  });

  describe('run()', () => {
    it('calls repository with the search term and returns task array when term is provided', async () => {
      mockTaskRepository.searchTasksByWorkspace.mockResolvedValue(mockTasks);

      const result = await useCase.run('ws-1', 'search term');

      expect(result).toEqual(mockTasks);
      expect(mockTaskRepository.searchTasksByWorkspace).toHaveBeenCalledWith('ws-1', 'search term');
    });

    it('returns empty array without calling repository when query is empty string', async () => {
      const result = await useCase.run('ws-1', '');

      expect(result).toEqual([]);
      expect(mockTaskRepository.searchTasksByWorkspace).not.toHaveBeenCalled();
    });
  });
});
