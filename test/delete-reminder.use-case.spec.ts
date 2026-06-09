import { Test, TestingModule } from '@nestjs/testing';
import { DeleteReminderUseCase } from '@/contexts/application/usecases/reminders';

describe('DeleteReminderUseCase', () => {
  let useCase: DeleteReminderUseCase;

  const mockReminderRepository = {
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockReminderRepository.delete.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteReminderUseCase,
        { provide: 'reminderRepository', useValue: mockReminderRepository },
      ],
    }).compile();

    useCase = module.get<DeleteReminderUseCase>(DeleteReminderUseCase);
  });

  describe('run()', () => {
    it('calls reminderRepository.delete with the correct reminderId and userId', async () => {
      await useCase.run('rem-1', 'user-1');

      expect(mockReminderRepository.delete).toHaveBeenCalledWith('rem-1', 'user-1');
    });

    it('returns void and delegates ownership check to the repository adapter', async () => {
      const result = await useCase.run('rem-2', 'user-2');

      expect(result).toBeUndefined();
      expect(mockReminderRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
