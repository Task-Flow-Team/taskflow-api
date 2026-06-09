import { RemoveTagFromTaskUseCase } from './removeTagFromTask.use-case';

describe('RemoveTagFromTaskUseCase', () => {
  it('should call taskRepository.removeTagFromTask with correct arguments', async () => {
    const mockRepo = {
      removeTagFromTask: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new RemoveTagFromTaskUseCase(mockRepo as any);
    await useCase.run('task-id', 'tag-id');

    expect(mockRepo.removeTagFromTask).toHaveBeenCalledWith('task-id', 'tag-id');
  });
});
