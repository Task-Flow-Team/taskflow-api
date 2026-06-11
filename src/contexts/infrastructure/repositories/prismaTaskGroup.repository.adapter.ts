import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { TaskGroupRepository } from '@/contexts/domain/repositories/taskGroup.repository.port';
import { TaskGroup } from '@/contexts/domain/models';

@Injectable()
export class PrismaTaskGroupRepository implements TaskGroupRepository {
  constructor(private db: PrismaService) {}

  async create(workspaceId: string, name: string, color: string): Promise<TaskGroup> {
    // Calculate next position as max+1 of existing groups in workspace
    const maxPosition = await this.db.taskGroup.aggregate({
      where: { workspace_id: workspaceId },
      _max: { position: true },
    });
    const position = (maxPosition._max.position ?? -1) + 1;

    return this.db.taskGroup.create({
      data: {
        workspace_id: workspaceId,
        name,
        color,
        position,
      },
    });
  }

  async getByWorkspace(workspaceId: string): Promise<TaskGroup[]> {
    return this.db.taskGroup.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { position: 'asc' },
    });
  }

  async getById(groupId: string): Promise<TaskGroup | null> {
    return this.db.taskGroup.findUnique({
      where: { group_id: groupId },
    });
  }

  async update(groupId: string, data: Partial<TaskGroup>): Promise<TaskGroup> {
    const group = await this.db.taskGroup.findUnique({ where: { group_id: groupId } });
    if (!group) throw new NotFoundException(`TaskGroup with ID ${groupId} not found`);

    return this.db.taskGroup.update({
      where: { group_id: groupId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.position !== undefined && { position: data.position }),
      },
    });
  }

  async delete(groupId: string): Promise<void> {
    const group = await this.db.taskGroup.findUnique({ where: { group_id: groupId } });
    if (!group) throw new NotFoundException(`TaskGroup with ID ${groupId} not found`);

    await this.db.taskGroup.delete({
      where: { group_id: groupId },
    });
  }
}
