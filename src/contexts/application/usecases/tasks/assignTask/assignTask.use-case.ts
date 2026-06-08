import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { WorkspaceRepository } from '@/contexts/domain/repositories/workspace.repository.port';
import { Task } from '@/contexts/domain/models';

@Injectable()
export class AssignTaskUseCase {

  constructor(
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('workspaceRepository') private workspaceRepository: WorkspaceRepository,
  ) {}

  async run(requesterId: string, taskId: string, assigneeId: string): Promise<Task> {

    // Get the task — throw 404 if not found
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    // Get workspace to check owner
    const workspace = await this.workspaceRepository.getWorkspaceById(task.workspace_id);

    // Get workspace collaborators
    const collaborators = await this.workspaceRepository.getAllCollaboratorsInWorkspace(task.workspace_id);

    // Validate that assignee is owner OR a collaborator
    const isOwner = workspace.user_id === assigneeId;
    const isCollaborator = collaborators.some(
      (c) => c.collaborator_id === assigneeId,
    );

    if (!isOwner && !isCollaborator) {
      throw new ForbiddenException('User is not a member of this workspace');
    }

    // Update the task with the new assignee
    return await this.taskRepository.updateTask(requesterId, taskId, { assignedTo: assigneeId });
  }
}
