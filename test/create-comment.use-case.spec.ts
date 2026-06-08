import { Test, TestingModule } from '@nestjs/testing';
import { CreateCommentUseCase } from '@/contexts/application/usecases/comments';

describe('CreateCommentUseCase', () => {
  let useCase: CreateCommentUseCase;

  const mockComment = {
    id: 'comment-1',
    content: 'Great task!',
    taskId: 'task-1',
    userId: 'user-1',
  };

  const mockCommentRepository = {
    createComment: jest.fn(),
  };

  const mockTaskRepository = {
    getTaskById: jest.fn(),
  };

  const mockNotificationRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockCommentRepository.createComment.mockResolvedValue(mockComment);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCommentUseCase,
        { provide: 'commentRepository', useValue: mockCommentRepository },
        { provide: 'taskRepository', useValue: mockTaskRepository },
        { provide: 'notificationRepository', useValue: mockNotificationRepository },
      ],
    }).compile();

    useCase = module.get<CreateCommentUseCase>(CreateCommentUseCase);
  });

  describe('run()', () => {
    it('creates comment and fires notification when task has assignee different from commenter', async () => {
      const task = { id: 'task-1', title: 'My Task', assignedTo: 'assignee-id' };
      mockTaskRepository.getTaskById.mockResolvedValue(task);

      const result = await useCase.run('user-1', 'task-1', 'Great task!');

      expect(result).toEqual(mockComment);
      expect(mockCommentRepository.createComment).toHaveBeenCalledWith('user-1', 'task-1', 'Great task!');

      // Allow fire-and-forget microtasks to flush
      await new Promise(process.nextTick);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        userId: 'assignee-id',
        notification_type: 'task_commented',
        message: `New comment on your task: ${task.title}`,
      });
    });

    it('creates comment without firing notification when task has no assignee', async () => {
      const task = { id: 'task-1', title: 'My Task', assignedTo: null };
      mockTaskRepository.getTaskById.mockResolvedValue(task);

      const result = await useCase.run('user-1', 'task-1', 'Great task!');

      expect(result).toEqual(mockComment);

      await new Promise(process.nextTick);

      expect(mockNotificationRepository.create).not.toHaveBeenCalled();
    });

    it('creates comment without firing notification when assignee is the commenter', async () => {
      const task = { id: 'task-1', title: 'My Task', assignedTo: 'user-1' };
      mockTaskRepository.getTaskById.mockResolvedValue(task);

      const result = await useCase.run('user-1', 'task-1', 'Great task!');

      expect(result).toEqual(mockComment);

      await new Promise(process.nextTick);

      expect(mockNotificationRepository.create).not.toHaveBeenCalled();
    });
  });
});
