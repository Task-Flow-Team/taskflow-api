import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { WorkspaceRepository } from '@/contexts/domain/repositories/workspace.repository.port';
import { NotificationRepository } from '@/contexts/domain/repositories/notification.repository.port';
import { UserRepository } from '@/contexts/domain/repositories/user.repository.port';
import { MailService } from '@/contexts/domain/services';
import { Task } from '@/contexts/domain/models';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AssignTaskUseCase {

  constructor(
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('workspaceRepository') private workspaceRepository: WorkspaceRepository,
    @Inject('notificationRepository') private notificationRepository: NotificationRepository,
    @Inject('userRepository') private userRepository: UserRepository,
    @Inject('mailService') private mailService: MailService,
    @Inject('configService') private configService: ConfigService,
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
    const updatedTask = await this.taskRepository.updateTask(requesterId, taskId, { assignedTo: assigneeId });

    // Fire-and-forget: in-app notification
    void this.notificationRepository.create({
      userId: assigneeId,
      notification_type: 'task_assigned',
      message: `You have been assigned to task: ${task.title}`,
    });

    // Fire-and-forget: email notification
    void (async () => {
      try {
        const assignee = await this.userRepository.findUniqueById(assigneeId);
        if (assignee?.email) {
          await this.mailService.send({
            to: [{ name: assignee.name || assignee.username, email: assignee.email }],
            from: {
              name: this.configService.get<string>('RESEND_FROM_NAME'),
              email: this.configService.get<string>('RESEND_FROM_EMAIL'),
            },
            subject: 'Task Assigned',
            text: 'You have been assigned to a task.',
            html: '<p>You have been assigned to a task.</p>',
          });
        }
      } catch (error) {
        console.error('[AssignTaskUseCase] Failed to send assignment email:', error);
      }
    })();

    return updatedTask;
  }
}
