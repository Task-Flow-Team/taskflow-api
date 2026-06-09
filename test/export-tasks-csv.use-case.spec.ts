import { Test, TestingModule } from '@nestjs/testing';
import { ExportTasksCsvUseCase } from '@/contexts/application/usecases/tasks';
import { Task } from '@/contexts/domain/models/task.entity';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  task_id: 'task-1',
  createdBy: 'user-1',
  workspace_id: 'ws-1',
  title: 'Default Task',
  description: null,
  status: 'OPEN',
  priority: 1,
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
  due_date: new Date('2024-06-15T00:00:00Z'),
  completed_at: null,
  assignedTo: 'user-assignee',
  ...overrides,
});

describe('ExportTasksCsvUseCase', () => {
  let useCase: ExportTasksCsvUseCase;

  const mockTaskRepository = {
    findAllByWorkspace: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportTasksCsvUseCase,
        { provide: 'taskRepository', useValue: mockTaskRepository },
      ],
    }).compile();

    useCase = module.get<ExportTasksCsvUseCase>(ExportTasksCsvUseCase);
  });

  describe('run()', () => {
    it('header row is the first line with correct column names', async () => {
      mockTaskRepository.findAllByWorkspace.mockResolvedValue([]);

      const csv = await useCase.run('ws-1');
      const lines = csv.split('\n');

      expect(lines[0]).toBe('id,title,status,priority,due_date,assignee,created_at');
    });

    it('task with due_date null and assignedTo null outputs empty strings for those columns', async () => {
      const task = makeTask({ due_date: null, assignedTo: null });
      mockTaskRepository.findAllByWorkspace.mockResolvedValue([task]);

      const csv = await useCase.run('ws-1');
      const lines = csv.split('\n');
      const dataRow = lines[1];
      const fields = dataRow.split(',');

      // due_date is column index 4, assignee is column index 5
      expect(fields[4]).toBe('');
      expect(fields[5]).toBe('');
      // Ensure they are not the string "null"
      expect(fields[4]).not.toBe('null');
      expect(fields[5]).not.toBe('null');
    });

    it('task with title containing comma wraps title in double quotes', async () => {
      const task = makeTask({ title: 'Fix bug, urgent', assignedTo: null, due_date: null });
      mockTaskRepository.findAllByWorkspace.mockResolvedValue([task]);

      const csv = await useCase.run('ws-1');
      const lines = csv.split('\n');
      const dataRow = lines[1];

      expect(dataRow).toContain('"Fix bug, urgent"');
    });

    it('task with title containing double quotes escapes them by doubling', async () => {
      const task = makeTask({ title: 'Say "hello"', assignedTo: null, due_date: null });
      mockTaskRepository.findAllByWorkspace.mockResolvedValue([task]);

      const csv = await useCase.run('ws-1');
      const lines = csv.split('\n');
      const dataRow = lines[1];

      expect(dataRow).toContain('"Say ""hello"""');
    });
  });
});
