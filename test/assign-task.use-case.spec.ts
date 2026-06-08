import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AssignTaskUseCase } from '@/contexts/application/usecases/tasks';

describe('AssignTaskUseCase', () => {
  let useCase: AssignTaskUseCase;

  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    workspace_id: 'ws-1',
    createdBy: 'owner-id',
    assignedTo: null,
  };

  const mockWorkspace = {
    id: 'ws-1',
    user_id: 'owner-id',
  };

  const mockCollaborators = [{ collaborator_id: 'collab-id' }];

  const mockTaskRepository = {
    getTaskById: jest.fn(),
    updateTask: jest.fn(),
  };

  const mockWorkspaceRepository = {
    getWorkspaceById: jest.fn(),
    getAllCollaboratorsInWorkspace: jest.fn(),
  };

  const mockNotificationRepository = {
    create: jest.fn(),
  };

  const mockUserRepository = {
    findUniqueById: jest.fn(),
  };

  const mockMailService = {
    send: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('noreply@test.com'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignTaskUseCase,
        { provide: 'taskRepository', useValue: mockTaskRepository },
        { provide: 'workspaceRepository', useValue: mockWorkspaceRepository },
        { provide: 'notificationRepository', useValue: mockNotificationRepository },
        { provide: 'userRepository', useValue: mockUserRepository },
        { provide: 'mailService', useValue: mockMailService },
        { provide: 'configService', useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<AssignTaskUseCase>(AssignTaskUseCase);
  });

  describe('run()', () => {
    it('assigns task when assignee is workspace owner and returns updated task', async () => {
      const updatedTask = { ...mockTask, assignedTo: 'owner-id' };
      mockTaskRepository.getTaskById.mockResolvedValue(mockTask);
      mockWorkspaceRepository.getWorkspaceById.mockResolvedValue(mockWorkspace);
      mockWorkspaceRepository.getAllCollaboratorsInWorkspace.mockResolvedValue([]);
      mockTaskRepository.updateTask.mockResolvedValue(updatedTask);
      mockUserRepository.findUniqueById.mockResolvedValue({ email: 'owner@test.com', name: 'Owner', username: 'owner' });

      const result = await useCase.run('requester-id', 'task-1', 'owner-id');

      expect(result).toEqual(updatedTask);
      expect(mockTaskRepository.updateTask).toHaveBeenCalledWith('requester-id', 'task-1', { assignedTo: 'owner-id' });
    });

    it('assigns task when assignee is a collaborator and returns updated task', async () => {
      const updatedTask = { ...mockTask, assignedTo: 'collab-id' };
      mockTaskRepository.getTaskById.mockResolvedValue(mockTask);
      mockWorkspaceRepository.getWorkspaceById.mockResolvedValue(mockWorkspace);
      mockWorkspaceRepository.getAllCollaboratorsInWorkspace.mockResolvedValue(mockCollaborators);
      mockTaskRepository.updateTask.mockResolvedValue(updatedTask);
      mockUserRepository.findUniqueById.mockResolvedValue({ email: 'collab@test.com', name: 'Collab', username: 'collab' });

      const result = await useCase.run('requester-id', 'task-1', 'collab-id');

      expect(result).toEqual(updatedTask);
      expect(mockTaskRepository.updateTask).toHaveBeenCalledWith('requester-id', 'task-1', { assignedTo: 'collab-id' });
    });

    it('throws NotFoundException when task does not exist', async () => {
      mockTaskRepository.getTaskById.mockResolvedValue(null);

      await expect(useCase.run('requester-id', 'task-1', 'owner-id')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when assignee is not a workspace member', async () => {
      mockTaskRepository.getTaskById.mockResolvedValue(mockTask);
      mockWorkspaceRepository.getWorkspaceById.mockResolvedValue(mockWorkspace);
      mockWorkspaceRepository.getAllCollaboratorsInWorkspace.mockResolvedValue([]);

      await expect(useCase.run('requester-id', 'task-1', 'stranger-id')).rejects.toThrow(ForbiddenException);
    });
  });
});
