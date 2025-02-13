import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { Task } from '@/contexts/domain/models';

@Injectable()
export class GetAllTasksOfUserUseCase {

  // This constructor takes a taskRepository as a dependency
  constructor(@Inject('taskRepository') private taskRepository: TaskRepository) {}
  
  // This function takes a userId as a parameter and returns an array of all tasks of the user provided
  async run(userId?: string): Promise<Task[]> {

    // Call the repository method to get all tasks of to the user provided
    return await this.taskRepository.getAllTasksOfUser(userId);

  }
}