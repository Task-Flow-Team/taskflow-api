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

  const mockUserRepository = {
    findUniqueByUsername: jest.fn(),
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
        { provide: 'userRepository', useValue: mockUserRepository },
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

    it('@mention: calls findUniqueByUsername and creates mention notification for mentioned user', async () => {
      const task = { id: 'task-1', title: 'My Task', assignedTo: null };
      const mentionedUser = { id: 'nahuel-id', username: 'nahuel' };
      mockTaskRepository.getTaskById.mockResolvedValue(task);
      mockUserRepository.findUniqueByUsername.mockResolvedValue(mentionedUser);

      await useCase.run('user-1', 'task-1', 'hey @nahuel check this');

      await new Promise(process.nextTick);

      expect(mockUserRepository.findUniqueByUsername).toHaveBeenCalledWith('nahuel');
      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        userId: 'nahuel-id',
        notification_type: 'mention',
        message: 'You were mentioned in a comment',
      });
    });

    it('@mention: does NOT create notification when mentioned user is the author (self-mention)', async () => {
      const task = { id: 'task-1', title: 'My Task', assignedTo: null };
      const selfUser = { id: 'user-1', username: 'self' };
      mockTaskRepository.getTaskById.mockResolvedValue(task);
      mockUserRepository.findUniqueByUsername.mockResolvedValue(selfUser);

      await useCase.run('user-1', 'task-1', '@self note');

      await new Promise(process.nextTick);

      expect(mockUserRepository.findUniqueByUsername).toHaveBeenCalledWith('self');
      expect(mockNotificationRepository.create).not.toHaveBeenCalled();
    });

    it('@mention: does NOT create notification and does not throw when mentioned username does not exist', async () => {
      const task = { id: 'task-1', title: 'My Task', assignedTo: null };
      mockTaskRepository.getTaskById.mockResolvedValue(task);
      mockUserRepository.findUniqueByUsername.mockResolvedValue(null);

      await expect(useCase.run('user-1', 'task-1', 'hey @ghost')).resolves.toEqual(mockComment);

      await new Promise(process.nextTick);

      expect(mockUserRepository.findUniqueByUsername).toHaveBeenCalledWith('ghost');
      expect(mockNotificationRepository.create).not.toHaveBeenCalled();
    });
  });
});
