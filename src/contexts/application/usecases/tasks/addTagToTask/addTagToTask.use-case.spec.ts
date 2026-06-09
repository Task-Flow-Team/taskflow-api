import { AddTagToTaskUseCase } from './addTagToTask.use-case';

describe('AddTagToTaskUseCase', () => {
  it('should call taskRepository.addTagToTask with correct arguments', async () => {
    const mockResult = { task_id: 'task-id', tag_id: 'tag-id' };
    const mockRepo = {
      addTagToTask: jest.fn().mockResolvedValue(mockResult),
    };

    const useCase = new AddTagToTaskUseCase(mockRepo as any);
    const result = await useCase.run('task-id', 'tag-id');

    expect(mockRepo.addTagToTask).toHaveBeenCalledWith('task-id', 'tag-id');
    expect(result).toEqual(mockResult);
  });
});
