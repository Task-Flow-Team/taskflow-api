import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { CreateTaskBody, Task, TaskTags } from '@/contexts/domain/models';
import { FilterTasksDto } from '@/contexts/infrastructure/http-api/v1/tasks/dtos';
import { PaginatedResponse, encodeCursor, decodeCursor } from '@/contexts/shared/pagination.types';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private db: PrismaService) {}

  async getAllTasks(limit?: number, orderBy?: 'desc' | 'asc'): Promise<Task[]> {
    // Return all tasks in descending order by default or the order and limit specified
    return this.db.task.findMany({
      orderBy: { created_at: orderBy ?? 'desc' },
      take: limit,
    });
  }

  async getAllTasksByWorkspaceId(workspaceId: string, filters?: FilterTasksDto): Promise<PaginatedResponse<Task>> {
    // Check if workspaceId is provided
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');

    // Check if workspace exists, if not throw an NotFoundException
    const workspace = await this.db.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace)
      throw new NotFoundException(`Workspace with ID ${workspaceId} not found`);

    const limit = Math.min(filters?.limit ?? 20, 100);
    const cursor = filters?.cursor ? decodeCursor(filters.cursor) : undefined;

    const where = {
      workspace_id: workspaceId,
      ...(filters?.status && { status: filters.status as any }),
      ...(filters?.priority !== undefined && { priority: filters.priority }),
      ...(filters?.assignedTo && { assignedTo: filters.assignedTo }),
      ...((filters?.dueDateBefore || filters?.dueDateAfter) && {
        due_date: {
          ...(filters?.dueDateBefore && { lte: new Date(filters.dueDateBefore) }),
          ...(filters?.dueDateAfter && { gte: new Date(filters.dueDateAfter) }),
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.db.task.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { task_id: cursor }, skip: 1 }),
        orderBy: { created_at: 'desc' },
      }),
      this.db.task.count({ where }),
    ]);

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? encodeCursor(data[data.length - 1].task_id) : null;

    return { data, nextCursor, total };
  }

  async getAllTasksCreatedByUser(userId: string): Promise<Task[]> {
    // Check if userId is provided
    if (!userId) throw new BadRequestException('User ID is required');

    // Check if user exists, if not throw an NotFoundException
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    // Get all tasks created by the user provided
    const tasks = await this.db.task.findMany({
      where: { createdBy: userId },
    });

    // Return the tasks found
    return tasks;
  }

  async getAllTasksAssignedToUser(userId: string): Promise<Task[]> {
    // Check if userId is provided
    if (!userId) throw new BadRequestException('User ID is required');

    // Check if user exists, if not throw an NotFoundException
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    // Get all tasks assigned to the user provided
    const tasks = await this.db.task.findMany({
      where: { assignedTo: userId },
    });

    // Return the tasks found
    return tasks;
  }

  async getAllTasksOfUser(userId: string): Promise<Task[]> {
    // Check if userId is provided
    if (!userId) throw new BadRequestException('User ID is required');

    // Check if user exists, if not throw an NotFoundException
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    // Get all tasks assigned to the user provided and created by the user provided
    const tasks = await this.db.task.findMany({
      where: { OR: [{ createdBy: userId }, { assignedTo: userId }] },
    });

    // Return the tasks found
    return tasks;
  }

  async getTaskById(taskId: string): Promise<Task> {
    // Check if taskId is provided
    if (!taskId) throw new BadRequestException('Task ID is required');

    // Check if task exists, if not throw an NotFoundException
    const task = await this.db.task.findUnique({
      where: { task_id: taskId },
      include: {
        taskTags: {
          include: { tag: true },
        },
      },
    });
    if (!task) throw new NotFoundException(`Task with ID ${taskId} not found`);

    // Map taskTags to a flat tags array
    const result = {
      ...task,
      tags: task.taskTags?.map((tt: any) => tt.tag) ?? [],
    };

    // Return the task found
    return result as Task;
  }

  async createTask(userId: string, task: Partial<Task>): Promise<Task> {

    // Check if userId is provided
    if (!userId) throw new BadRequestException('User ID is required');

    // Check if task is provided
    if(!task) throw new BadRequestException('Task Object is required');

    // Check if workspaceId is provided in the Task Object
    if (!task.workspace_id) throw new BadRequestException('Workspace ID in Task Object is required');

    // Check if user exists, if not throw an NotFoundException
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    // Check if workspace exists, if not throw an NotFoundException
    const workspace = await this.db.workspace.findUnique({
      where: { id: task.workspace_id },
    });
    if (!workspace) throw new NotFoundException(`Workspace with ID ${task.workspace_id} not found`);

    // Create the new task.
    const createdTask = await this.db.task.create({
      data: {
        createdBy: userId,
        workspace_id: task.workspace_id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        assignedTo: task.assignedTo,
      },
    });

    // Return the task created
    return createdTask;
  }

  async deleteTask(taskId: string): Promise<void> {

    // Check if taskId is provided
    if (!taskId) throw new BadRequestException('Task ID is required');
    
    // Check if task exists, if not throw an NotFoundException
    const task = await this.db.task.findUnique({ where: { task_id: taskId } });
    if (!task) throw new NotFoundException(`Task with ID ${taskId} not found`);

    // Delete the task
    await this.db.task.delete({
      where: { task_id: taskId },
    });

  }

  async searchTasksByWorkspace(workspaceId: string, q: string): Promise<Task[]> {
    return this.db.task.findMany({
      where: {
        workspace_id: workspaceId,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }

  async findAllByWorkspace(workspaceId: string): Promise<Task[]> {
    return this.db.task.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateTask(userId: string, taskId: string, task: Partial<Task>): Promise<Task> {

    // Check if taskId is provided
    if (!taskId) throw new BadRequestException('Task ID is required');

    // Check if task object is provided
    if(!task) throw new BadRequestException('Task Object is required');

    // Check if task exists, if not throw an NotFoundException
    const taskToUpdate = await this.db.task.findUnique({ where: { task_id: taskId } });
    if (!taskToUpdate) throw new NotFoundException(`Task with ID ${taskId} not found`);

    // Use workspace_id from the existing task (no need to send it in the update body)
    const workspaceId = task.workspace_id ?? taskToUpdate.workspace_id;

    // Check if user exists, if not throw an NotFoundException
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    // Check if workspace exists, if not throw an NotFoundException
    const workspace = await this.db.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) throw new NotFoundException(`Workspace with ID ${workspaceId} not found`);

    // Update the task
    const updatedTask = await this.db.task.update({
      where: { task_id: taskId },
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        assignedTo: task.assignedTo,
        completed_at: task.completed_at,
      },
    });

    // Return the task updated
    return updatedTask;
  }

  async addTagToTask(taskId: string, tagId: string): Promise<TaskTags> {
    if (!taskId) throw new BadRequestException('Task ID is required');
    if (!tagId) throw new BadRequestException('Tag ID is required');

    const task = await this.db.task.findUnique({ where: { task_id: taskId } });
    if (!task) throw new NotFoundException(`Task with ID ${taskId} not found`);

    const tag = await this.db.tags.findUnique({ where: { tag_id: tagId } });
    if (!tag) throw new NotFoundException(`Tag with ID ${tagId} not found`);

    const existing = await this.db.taskTags.findUnique({
      where: { task_id_tag_id: { task_id: taskId, tag_id: tagId } },
    });
    if (existing) throw new ConflictException('Tag already assigned to this task');

    return this.db.taskTags.create({
      data: { task_id: taskId, tag_id: tagId },
    }) as Promise<TaskTags>;
  }

  async removeTagFromTask(taskId: string, tagId: string): Promise<void> {
    if (!taskId) throw new BadRequestException('Task ID is required');
    if (!tagId) throw new BadRequestException('Tag ID is required');

    try {
      await this.db.taskTags.delete({
        where: { task_id_tag_id: { task_id: taskId, tag_id: tagId } },
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Tag assignment not found`);
      }
      throw error;
    }
  }

}
