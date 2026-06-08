import { Test, TestingModule } from '@nestjs/testing';
import { SubTaskController } from '@/contexts/infrastructure/http-api/v1/subtasks/SubTasks.controller';
import * as SubTaskUseCases from '@/contexts/application/usecases/subtasks';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';

describe('SubTaskController', () => {
  let controller: SubTaskController;
  let createSubTaskUseCase: SubTaskUseCases.CreateSubTaskUseCase;
  let getSubTaskByIdUseCase: SubTaskUseCases.GetSubTaskByIdUseCase;
  let getAllSubTasksByParentUseCase: SubTaskUseCases.GetAllSubTasksByParentUseCase;
  let updateSubTaskUseCase: SubTaskUseCases.UpdateSubTaskUseCase;
  let deleteSubTaskUseCase: SubTaskUseCases.DeleteSubTaskUseCase;

  const mockSubTask = { id: 'sub-1', title: 'Sub Task', parentTaskId: 'task-1', createdBy: 'user-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubTaskController],
      providers: [
        { provide: SubTaskUseCases.CreateSubTaskUseCase, useValue: { run: jest.fn() } },
        { provide: SubTaskUseCases.DeleteSubTaskUseCase, useValue: { run: jest.fn() } },
        { provide: SubTaskUseCases.GetAllSubTasksAssignedToUserUseCase, useValue: { run: jest.fn() } },
        { provide: SubTaskUseCases.GetAllSubTasksByParentUseCase, useValue: { run: jest.fn() } },
        { provide: SubTaskUseCases.GetAllSubTasksByWorkspaceUseCase, useValue: { run: jest.fn() } },
        { provide: SubTaskUseCases.GetAllSubTasksCreatedByUserUseCase, useValue: { run: jest.fn() } },
        { provide: SubTaskUseCases.GetAllSubTasksOfUserUseCase, useValue: { run: jest.fn() } },
        { provide: SubTaskUseCases.GetAllSubTasksUseCase, useValue: { run: jest.fn() } },
        { provide: SubTaskUseCases.GetSubTaskByIdUseCase, useValue: { run: jest.fn() } },
        { provide: SubTaskUseCases.UpdateSubTaskUseCase, useValue: { run: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SubTaskController>(SubTaskController);
    createSubTaskUseCase = module.get(SubTaskUseCases.CreateSubTaskUseCase);
    getSubTaskByIdUseCase = module.get(SubTaskUseCases.GetSubTaskByIdUseCase);
    getAllSubTasksByParentUseCase = module.get(SubTaskUseCases.GetAllSubTasksByParentUseCase);
    updateSubTaskUseCase = module.get(SubTaskUseCases.UpdateSubTaskUseCase);
    deleteSubTaskUseCase = module.get(SubTaskUseCases.DeleteSubTaskUseCase);
  });

  describe('createSubTask', () => {
    it('should return message and subtask on success', async () => {
      jest.spyOn(createSubTaskUseCase, 'run').mockResolvedValue(mockSubTask as any);
      const result = await controller.createSubTask({ id: 'user-1' }, { title: 'Sub Task', parentTaskId: 'task-1' } as any);
      expect(result).toEqual({ message: 'Subtask created successfully', subTask: mockSubTask });
    });

    it('should propagate errors from use case', async () => {
      jest.spyOn(createSubTaskUseCase, 'run').mockRejectedValue(new Error('DB error'));
      await expect(controller.createSubTask({ id: 'user-1' }, {} as any)).rejects.toThrow('DB error');
    });
  });

  describe('getSubTaskById', () => {
    it('should return the subtask', async () => {
      jest.spyOn(getSubTaskByIdUseCase, 'run').mockResolvedValue(mockSubTask as any);
      const result = await controller.getSubTaskById('sub-1');
      expect(result).toEqual(mockSubTask);
    });
  });

  describe('getAllSubTasksByParent', () => {
    it('should return subtasks for the given parent task', async () => {
      jest.spyOn(getAllSubTasksByParentUseCase, 'run').mockResolvedValue([mockSubTask] as any);
      const result = await controller.getAllSubTasksByParent('task-1');
      expect(result).toEqual([mockSubTask]);
    });
  });

  describe('updateSubTask', () => {
    it('should return message and updated subtask', async () => {
      const updated = { ...mockSubTask, title: 'Updated' };
      jest.spyOn(updateSubTaskUseCase, 'run').mockResolvedValue(updated as any);
      const result = await controller.updateSubTask({ id: 'user-1' }, 'sub-1', { title: 'Updated' } as any);
      expect(result).toEqual({ message: 'Subtask updated successfully', subTask: updated });
    });
  });

  describe('deleteSubTask', () => {
    it('should return success message', async () => {
      jest.spyOn(deleteSubTaskUseCase, 'run').mockResolvedValue(undefined as any);
      const result = await controller.deleteSubTask('sub-1');
      expect(result).toEqual({ message: 'Subtask deleted successfully' });
    });
  });
});
