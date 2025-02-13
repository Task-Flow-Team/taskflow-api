import { Inject, Injectable } from '@nestjs/common';
import { SubTaskRepository } from '@/contexts/domain/repositories/';
import { SubTask } from '@/contexts/domain/models';

@Injectable()
export class GetAllSubTasksCreatedByUserUseCase {

  // This constructor takes a subTaskRepository as a dependency
  constructor(@Inject('subTaskRepository') private subTaskRepository: SubTaskRepository) {}
  
  // This function takes a userId as a parameter and returns an array of all sub tasks created by the user provided
  async run(userId?: string): Promise<SubTask[]> {

    // Call the repository method to get all sub tasks created by the user provided
    return await this.subTaskRepository.getAllSubTasksCreatedByUser(userId);

  }
}