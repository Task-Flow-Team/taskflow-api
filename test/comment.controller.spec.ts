import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from '@/contexts/infrastructure/http-api/v1/comments/Comments.controller';
import * as CommentUseCases from '@/contexts/application/usecases/comments';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';

describe('CommentController', () => {
  let controller: CommentController;
  let createCommentUseCase: CommentUseCases.CreateCommentUseCase;
  let getCommentsByTaskUseCase: CommentUseCases.GetCommentsByTaskUseCase;
  let getCommentByIdUseCase: CommentUseCases.GetCommentByIdUseCase;
  let updateCommentUseCase: CommentUseCases.UpdateCommentUseCase;
  let deleteCommentUseCase: CommentUseCases.DeleteCommentUseCase;

  const mockComment = { id: 'comment-1', content: 'Test comment', taskId: 'task-1', userId: 'user-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        { provide: CommentUseCases.CreateCommentUseCase, useValue: { run: jest.fn() } },
        { provide: CommentUseCases.UpdateCommentUseCase, useValue: { run: jest.fn() } },
        { provide: CommentUseCases.DeleteCommentUseCase, useValue: { run: jest.fn() } },
        { provide: CommentUseCases.GetCommentsByTaskUseCase, useValue: { run: jest.fn() } },
        { provide: CommentUseCases.GetCommentByIdUseCase, useValue: { run: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CommentController>(CommentController);
    createCommentUseCase = module.get(CommentUseCases.CreateCommentUseCase);
    getCommentsByTaskUseCase = module.get(CommentUseCases.GetCommentsByTaskUseCase);
    getCommentByIdUseCase = module.get(CommentUseCases.GetCommentByIdUseCase);
    updateCommentUseCase = module.get(CommentUseCases.UpdateCommentUseCase);
    deleteCommentUseCase = module.get(CommentUseCases.DeleteCommentUseCase);
  });

  describe('createComment', () => {
    it('should return message and comment on success', async () => {
      jest.spyOn(createCommentUseCase, 'run').mockResolvedValue(mockComment as any);
      const result = await controller.createComment('user-1', 'task-1', { content: 'Test comment' });
      expect(result).toEqual({ message: 'Comment created successfully', comment: mockComment });
    });

    it('should propagate errors from use case', async () => {
      jest.spyOn(createCommentUseCase, 'run').mockRejectedValue(new Error('Task not found'));
      await expect(controller.createComment('user-1', 'task-1', { content: 'Test' })).rejects.toThrow('Task not found');
    });
  });

  describe('getCommentsByTask', () => {
    it('should return comments for the task', async () => {
      jest.spyOn(getCommentsByTaskUseCase, 'run').mockResolvedValue([mockComment] as any);
      const result = await controller.getCommentsByTask('task-1');
      expect(result).toEqual([mockComment]);
    });
  });

  describe('getCommentById', () => {
    it('should return the comment', async () => {
      jest.spyOn(getCommentByIdUseCase, 'run').mockResolvedValue(mockComment as any);
      const result = await controller.getCommentById('comment-1');
      expect(result).toEqual(mockComment);
    });
  });

  describe('updateComment', () => {
    it('should return message and updated comment', async () => {
      const updated = { ...mockComment, content: 'Updated' };
      jest.spyOn(updateCommentUseCase, 'run').mockResolvedValue(updated as any);
      const result = await controller.updateComment('comment-1', { content: 'Updated' });
      expect(result).toEqual({ message: 'Comment updated successfully', comment: updated });
    });
  });

  describe('deleteComment', () => {
    it('should return success message', async () => {
      jest.spyOn(deleteCommentUseCase, 'run').mockResolvedValue(undefined as any);
      const result = await controller.deleteComment('comment-1');
      expect(result).toEqual({ message: 'Comment deleted successfully' });
    });
  });
});
