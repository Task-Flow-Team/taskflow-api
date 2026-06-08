import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TaskController } from '@/contexts/infrastructure/http-api/v1/tasks/Task.controller';
import * as TaskUseCases from '@/contexts/application/usecases/tasks';
import { JwtAuthGuard, WorkspaceMemberGuard } from '@/contexts/shared/lib/guards';

describe('TaskController', () => {
  let controller: TaskController;
  let createTaskUseCase: TaskUseCases.CreateTaskUseCase;
  let deleteTaskUseCase: TaskUseCases.DeleteTaskUseCase;
  let updateTaskUseCase: TaskUseCases.UpdateTaskUseCase;
  let getAllTasksByWorkspaceUseCase: TaskUseCases.GetAllTasksByWorkspaceUseCase;
  let getTaskByIdUseCase: TaskUseCases.GetTaskByIdUseCase;

  const mockTask = { id: 'task-1', title: 'Test Task', createdBy: 'user-1', workspaceId: 'ws-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        { provide: TaskUseCases.CreateTaskUseCase, useValue: { run: jest.fn() } },
        { provide: TaskUseCases.DeleteTaskUseCase, useValue: { run: jest.fn() } },
        { provide: TaskUseCases.UpdateTaskUseCase, useValue: { run: jest.fn() } },
        { provide: TaskUseCases.GetAllTasksAssignedToUserUseCase, useValue: { run: jest.fn() } },
        { provide: TaskUseCases.GetAllTasksByWorkspaceUseCase, useValue: { run: jest.fn() } },
        { provide: TaskUseCases.GetAllTasksCreatedByUserUseCase, useValue: { run: jest.fn() } },
        { provide: TaskUseCases.GetAllTasksOfUserUseCase, useValue: { run: jest.fn() } },
        { provide: TaskUseCases.GetAllTasksUseCase, useValue: { run: jest.fn() } },
        { provide: TaskUseCases.GetTaskByIdUseCase, useValue: { run: jest.fn() } },
        { provide: TaskUseCases.AssignTaskUseCase, useValue: { run: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceMemberGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TaskController>(TaskController);
    createTaskUseCase = module.get(TaskUseCases.CreateTaskUseCase);
    deleteTaskUseCase = module.get(TaskUseCases.DeleteTaskUseCase);
    updateTaskUseCase = module.get(TaskUseCases.UpdateTaskUseCase);
    getAllTasksByWorkspaceUseCase = module.get(TaskUseCases.GetAllTasksByWorkspaceUseCase);
    getTaskByIdUseCase = module.get(TaskUseCases.GetTaskByIdUseCase);
  });

  describe('createTask', () => {
    it('should return message and task on success', async () => {
      jest.spyOn(createTaskUseCase, 'run').mockResolvedValue(mockTask as any);
      const result = await controller.createTask('user-1', { title: 'Test Task' } as any);
      expect(result).toEqual({ message: 'Task created successfully', task: mockTask });
    });

    it('should propagate errors from use case', async () => {
      jest.spyOn(createTaskUseCase, 'run').mockRejectedValue(new Error('DB error'));
      await expect(controller.createTask('user-1', {} as any)).rejects.toThrow('DB error');
    });
  });

  describe('getTaskById', () => {
    it('should return the task', async () => {
      jest.spyOn(getTaskByIdUseCase, 'run').mockResolvedValue(mockTask as any);
      const result = await controller.getTaskById('task-1');
      expect(result).toEqual(mockTask);
    });
  });

  describe('getAllTasksByWorkspace', () => {
    it('should return an array of tasks', async () => {
      jest.spyOn(getAllTasksByWorkspaceUseCase, 'run').mockResolvedValue([mockTask] as any);
      const result = await controller.getAllTasksByWorkspace('ws-1');
      expect(result).toEqual([mockTask]);
    });
  });

  describe('updateTask', () => {
    it('should return message and updated task', async () => {
      const updated = { ...mockTask, title: 'Updated' };
      jest.spyOn(updateTaskUseCase, 'run').mockResolvedValue(updated as any);
      const result = await controller.updateTask('user-1', 'task-1', { title: 'Updated' } as any);
      expect(result).toEqual({ message: 'Task updated successfully', task: updated });
    });
  });

  describe('deleteTask', () => {
    it('should delete task when user is the owner', async () => {
      jest.spyOn(getTaskByIdUseCase, 'run').mockResolvedValue(mockTask as any);
      jest.spyOn(deleteTaskUseCase, 'run').mockResolvedValue(undefined as any);
      const result = await controller.deleteTask('user-1', 'task-1');
      expect(result).toEqual({ message: 'Task deleted successfully' });
    });

    it('should throw NotFoundException when task does not exist', async () => {
      jest.spyOn(getTaskByIdUseCase, 'run').mockResolvedValue(null as any);
      await expect(controller.deleteTask('user-1', 'task-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      jest.spyOn(getTaskByIdUseCase, 'run').mockResolvedValue({ ...mockTask, createdBy: 'other-user' } as any);
      await expect(controller.deleteTask('user-1', 'task-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
