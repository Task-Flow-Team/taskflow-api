import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceController } from '@/contexts/infrastructure/http-api/v1/workspace/Workspace.controller';
import * as WorkspaceUseCases from '@/contexts/application/usecases/workspaces';
import { JwtAuthGuard, WorkspaceMemberGuard } from '@/contexts/shared/lib/guards';

describe('WorkspaceController', () => {
  let controller: WorkspaceController;
  let createWorkspaceUseCase: WorkspaceUseCases.CreateWorkspaceUseCase;
  let getWorkspaceByIdUseCase: WorkspaceUseCases.GetWorkspaceByIdUseCase;
  let getWorkspacesOfUserUseCase: WorkspaceUseCases.GetAllWorkspacesOfUserUseCase;
  let updateWorkspaceUseCase: WorkspaceUseCases.UpdateWorkspaceUseCase;
  let deleteWorkspaceUseCase: WorkspaceUseCases.DeleteWorkspaceUseCase;
  let addCollaboratorUseCase: WorkspaceUseCases.AddCollaboratorUseCase;
  let deleteCollaboratorUseCase: WorkspaceUseCases.DeleteCollaboratorUseCase;
  let getCollaboratorsUseCase: WorkspaceUseCases.GetCollaboratorsUseCase;

  const mockWorkspace = { id: 'ws-1', name: 'Test WS', createdBy: 'user-1' };
  const mockCollaborator = { workspaceId: 'ws-1', userId: 'user-2' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [
        { provide: WorkspaceUseCases.CreateWorkspaceUseCase, useValue: { run: jest.fn() } },
        { provide: WorkspaceUseCases.DeleteWorkspaceUseCase, useValue: { run: jest.fn() } },
        { provide: WorkspaceUseCases.UpdateWorkspaceUseCase, useValue: { run: jest.fn() } },
        { provide: WorkspaceUseCases.GetAllWorkspacesUseCase, useValue: { run: jest.fn() } },
        { provide: WorkspaceUseCases.GetAllWorkspacesCreatedByUserUseCase, useValue: { run: jest.fn() } },
        { provide: WorkspaceUseCases.GetAllWorkspacesOfUserUseCase, useValue: { run: jest.fn() } },
        { provide: WorkspaceUseCases.GetAllWorkspacesAsCollaborator, useValue: { run: jest.fn() } },
        { provide: WorkspaceUseCases.GetWorkspaceByIdUseCase, useValue: { run: jest.fn() } },
        { provide: WorkspaceUseCases.AddCollaboratorUseCase, useValue: { run: jest.fn() } },
        { provide: WorkspaceUseCases.GetCollaboratorsUseCase, useValue: { run: jest.fn() } },
        { provide: WorkspaceUseCases.DeleteCollaboratorUseCase, useValue: { run: jest.fn() } },
        { provide: WorkspaceUseCases.GetActivityByWorkspaceUseCase, useValue: { run: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceMemberGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkspaceController>(WorkspaceController);
    createWorkspaceUseCase = module.get(WorkspaceUseCases.CreateWorkspaceUseCase);
    getWorkspaceByIdUseCase = module.get(WorkspaceUseCases.GetWorkspaceByIdUseCase);
    getWorkspacesOfUserUseCase = module.get(WorkspaceUseCases.GetAllWorkspacesOfUserUseCase);
    updateWorkspaceUseCase = module.get(WorkspaceUseCases.UpdateWorkspaceUseCase);
    deleteWorkspaceUseCase = module.get(WorkspaceUseCases.DeleteWorkspaceUseCase);
    addCollaboratorUseCase = module.get(WorkspaceUseCases.AddCollaboratorUseCase);
    deleteCollaboratorUseCase = module.get(WorkspaceUseCases.DeleteCollaboratorUseCase);
    getCollaboratorsUseCase = module.get(WorkspaceUseCases.GetCollaboratorsUseCase);
  });

  describe('createWorkspace', () => {
    it('should return message and workspace on success', async () => {
      jest.spyOn(createWorkspaceUseCase, 'run').mockResolvedValue(mockWorkspace as any);
      const result = await controller.createWorkspace('user-1', { name: 'Test WS', description: 'desc' });
      expect(result).toEqual({ message: 'Workspace created successfully', workspace: mockWorkspace });
    });

    it('should propagate errors from use case', async () => {
      jest.spyOn(createWorkspaceUseCase, 'run').mockRejectedValue(new Error('DB error'));
      await expect(controller.createWorkspace('user-1', { name: 'Test WS', description: '' })).rejects.toThrow('DB error');
    });
  });

  describe('getWorkspaceById', () => {
    it('should return the workspace', async () => {
      jest.spyOn(getWorkspaceByIdUseCase, 'run').mockResolvedValue(mockWorkspace as any);
      const result = await controller.getWorkspaceById('ws-1');
      expect(result).toEqual(mockWorkspace);
    });
  });

  describe('getMyWorkspaces', () => {
    it('should return workspaces of the user', async () => {
      jest.spyOn(getWorkspacesOfUserUseCase, 'run').mockResolvedValue([mockWorkspace] as any);
      const result = await controller.getMyWorkspaces('user-1');
      expect(result).toEqual([mockWorkspace]);
    });
  });

  describe('updateWorkspace', () => {
    it('should return message and updated workspace', async () => {
      const updated = { ...mockWorkspace, name: 'Updated WS' };
      jest.spyOn(updateWorkspaceUseCase, 'run').mockResolvedValue(updated as any);
      const result = await controller.updateWorkspace('ws-1', { name: 'Updated WS' } as any);
      expect(result).toEqual({ message: 'Workspace updated successfully', workspace: updated });
    });
  });

  describe('deleteWorkspace', () => {
    it('should return success message', async () => {
      jest.spyOn(deleteWorkspaceUseCase, 'run').mockResolvedValue(undefined as any);
      const result = await controller.deleteWorkspace('ws-1');
      expect(result).toEqual({ message: 'Workspace deleted successfully' });
    });
  });

  describe('addCollaborator', () => {
    it('should return message and collaborator', async () => {
      jest.spyOn(addCollaboratorUseCase, 'run').mockResolvedValue(mockCollaborator as any);
      const result = await controller.addCollaborator('ws-1', { userId: 'user-2' });
      expect(result).toEqual({ message: 'Collaborator added successfully', collaborator: mockCollaborator });
    });
  });

  describe('getCollaborators', () => {
    it('should return collaborators list', async () => {
      jest.spyOn(getCollaboratorsUseCase, 'run').mockResolvedValue([mockCollaborator] as any);
      const result = await controller.getCollaborators('ws-1');
      expect(result).toEqual([mockCollaborator]);
    });
  });

  describe('removeCollaborator', () => {
    it('should return success message', async () => {
      jest.spyOn(deleteCollaboratorUseCase, 'run').mockResolvedValue(undefined as any);
      const result = await controller.removeCollaborator('ws-1', 'user-2');
      expect(result).toEqual({ message: 'Collaborator removed succesfully' });
    });
  });
});
