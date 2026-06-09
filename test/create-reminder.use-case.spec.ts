import { Test, TestingModule } from '@nestjs/testing';
import { CreateReminderUseCase } from '@/contexts/application/usecases/reminders';
import { Reminder } from '@/contexts/domain/models/reminder.entity';

describe('CreateReminderUseCase', () => {
  let useCase: CreateReminderUseCase;

  const mockReminder: Reminder = {
    reminder_id: 'rem-1',
    task_id: 'task-1',
    user_id: 'user-1',
    reminder_time: new Date('2026-07-01T09:00:00Z'),
    reminder_type: 'email',
    is_sent: false,
  };

  const mockReminderRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockReminderRepository.create.mockResolvedValue(mockReminder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReminderUseCase,
        { provide: 'reminderRepository', useValue: mockReminderRepository },
      ],
    }).compile();

    useCase = module.get<CreateReminderUseCase>(CreateReminderUseCase);
  });

  describe('run()', () => {
    it('calls reminderRepository.create with correct fields including user_id from userId param', async () => {
      const dto = {
        task_id: 'task-1',
        reminder_time: '2026-07-01T09:00:00Z',
        reminder_type: 'email',
      };

      const result = await useCase.run('user-1', dto);

      expect(result).toEqual(mockReminder);
      expect(mockReminderRepository.create).toHaveBeenCalledWith({
        task_id: 'task-1',
        user_id: 'user-1',
        reminder_time: new Date('2026-07-01T09:00:00Z'),
        reminder_type: 'email',
      });
    });

    it('passes reminder_type as undefined when not provided in dto', async () => {
      const dto = {
        task_id: 'task-2',
        reminder_time: '2026-08-01T10:00:00Z',
      };

      await useCase.run('user-2', dto);

      expect(mockReminderRepository.create).toHaveBeenCalledWith({
        task_id: 'task-2',
        user_id: 'user-2',
        reminder_time: new Date('2026-08-01T10:00:00Z'),
        reminder_type: undefined,
      });
    });
  });
});
