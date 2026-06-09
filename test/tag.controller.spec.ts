import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from '@/contexts/infrastructure/http-api/v1/tags/Tags.controller';
import * as TagUseCases from '@/contexts/application/usecases/tags';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';

describe('TagController', () => {
  let controller: TagController;
  let createTagUseCase: TagUseCases.CreateTagUseCase;
  let getAllTagsByWorkspaceUseCase: TagUseCases.GetAllTagsByWorkspaceUseCase;
  let getTagByIdUseCase: TagUseCases.GetTagByIdUseCase;
  let updateTagUseCase: TagUseCases.UpdateTagUseCase;
  let deleteTagUseCase: TagUseCases.DeleteTagUseCase;

  const mockTag = { id: 'tag-1', name: 'urgent', workspaceId: 'ws-1', createdBy: 'user-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        { provide: TagUseCases.CreateTagUseCase, useValue: { run: jest.fn() } },
        { provide: TagUseCases.DeleteTagUseCase, useValue: { run: jest.fn() } },
        { provide: TagUseCases.GetAllTagsByWorkspaceUseCase, useValue: { run: jest.fn() } },
        { provide: TagUseCases.GetAllTagsCreatedByUserUseCase, useValue: { run: jest.fn() } },
        { provide: TagUseCases.GetAllTagsOfUserUseCase, useValue: { run: jest.fn() } },
        { provide: TagUseCases.GetAllTagsUseCase, useValue: { run: jest.fn() } },
        { provide: TagUseCases.GetTagByIdUseCase, useValue: { run: jest.fn() } },
        { provide: TagUseCases.GetTagByNameAndUserUseCase, useValue: { run: jest.fn() } },
        { provide: TagUseCases.UpdateTagUseCase, useValue: { run: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TagController>(TagController);
    createTagUseCase = module.get(TagUseCases.CreateTagUseCase);
    getAllTagsByWorkspaceUseCase = module.get(TagUseCases.GetAllTagsByWorkspaceUseCase);
    getTagByIdUseCase = module.get(TagUseCases.GetTagByIdUseCase);
    updateTagUseCase = module.get(TagUseCases.UpdateTagUseCase);
    deleteTagUseCase = module.get(TagUseCases.DeleteTagUseCase);
  });

  describe('createTag', () => {
    it('should return message and tag on success', async () => {
      jest.spyOn(createTagUseCase, 'run').mockResolvedValue(mockTag as any);
      const result = await controller.createTag({ id: 'user-1' }, { name: 'urgent', workspace_id: 'ws-1' } as any);
      expect(result).toEqual({ message: 'Tag created successfully', tag: mockTag });
    });

    it('should propagate errors from use case', async () => {
      jest.spyOn(createTagUseCase, 'run').mockRejectedValue(new Error('Tag already exists'));
      await expect(controller.createTag({ id: 'user-1' }, {} as any)).rejects.toThrow('Tag already exists');
    });
  });

  describe('getAllTagsByWorkspace', () => {
    it('should return tags for the workspace', async () => {
      jest.spyOn(getAllTagsByWorkspaceUseCase, 'run').mockResolvedValue([mockTag] as any);
      const result = await controller.getAllTagsByWorkspace('ws-1');
      expect(result).toEqual([mockTag]);
    });
  });

  describe('getTagById', () => {
    it('should return the tag', async () => {
      jest.spyOn(getTagByIdUseCase, 'run').mockResolvedValue(mockTag as any);
      const result = await controller.getTagById('tag-1');
      expect(result).toEqual(mockTag);
    });
  });

  describe('updateTag', () => {
    it('should return message and updated tag', async () => {
      const updated = { ...mockTag, name: 'low-priority' };
      jest.spyOn(updateTagUseCase, 'run').mockResolvedValue(updated as any);
      const result = await controller.updateTag('tag-1', { name: 'low-priority' } as any);
      expect(result).toEqual({ message: 'Tag updated successfully', tag: updated });
    });
  });

  describe('deleteTag', () => {
    it('should return success message', async () => {
      jest.spyOn(deleteTagUseCase, 'run').mockResolvedValue(undefined as any);
      const result = await controller.deleteTag('tag-1');
      expect(result).toEqual({ message: 'Tag deleted successfully' });
    });
  });
});
