import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { AnalyticsRepository } from '@/contexts/domain/repositories/analytics.repository.port';
import {
  CompletedPerDay,
  OverdueTaskDto,
  StatusCounts,
  WorkloadEntry,
  WorkspaceSummaryDto,
} from '@/contexts/domain/models/analytics.entity';

@Injectable()
export class PrismaAnalyticsRepository implements AnalyticsRepository {
  constructor(private db: PrismaService) {}

  async getWorkspaceSummary(workspaceId: string): Promise<WorkspaceSummaryDto> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // --- statusCounts ---
    const statusGroups = await this.db.task.groupBy({
      by: ['status'],
      where: { workspace_id: workspaceId },
      _count: { task_id: true },
    });

    const statusCounts: StatusCounts = { OPEN: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    for (const group of statusGroups) {
      if (group.status === 'OPEN') statusCounts.OPEN = group._count.task_id;
      else if (group.status === 'IN_PROGRESS') statusCounts.IN_PROGRESS = group._count.task_id;
      else if (group.status === 'COMPLETED') statusCounts.COMPLETED = group._count.task_id;
    }

    // --- workload (open tasks per assignee) ---
    const workloadGroups = await this.db.task.groupBy({
      by: ['assignedTo'],
      where: {
        workspace_id: workspaceId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
      _count: { task_id: true },
    });

    const assigneeIds = workloadGroups
      .filter((g) => g.assignedTo !== null)
      .map((g) => g.assignedTo as string);

    const users = assigneeIds.length > 0
      ? await this.db.user.findMany({
          where: { id: { in: assigneeIds } },
          select: { id: true, username: true, name: true },
        })
      : [];

    const userMap = new Map(users.map((u) => [u.id, u.name ?? u.username]));

    const workload: WorkloadEntry[] = workloadGroups.map((g) => ({
      assigneeId: g.assignedTo,
      assignee: g.assignedTo ? (userMap.get(g.assignedTo) ?? 'Unknown') : 'Unassigned',
      openTasks: g._count.task_id,
    }));

    // --- completedPerDay (last 30 days, contiguous) ---
    const completedTasks = await this.db.task.findMany({
      where: {
        workspace_id: workspaceId,
        status: 'COMPLETED',
        OR: [
          { completed_at: { gte: thirtyDaysAgo, lte: now } },
          { completed_at: null, updated_at: { gte: thirtyDaysAgo, lte: now } },
        ],
      },
      select: { completed_at: true, updated_at: true },
    });

    // Build a map of date -> count
    const countByDate = new Map<string, number>();
    for (const task of completedTasks) {
      const dateSource = task.completed_at ?? task.updated_at;
      const dateKey = dateSource.toISOString().slice(0, 10);
      countByDate.set(dateKey, (countByDate.get(dateKey) ?? 0) + 1);
    }

    // Build 30 contiguous days (oldest first)
    const completedPerDay: CompletedPerDay[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      completedPerDay.push({ date: dateKey, count: countByDate.get(dateKey) ?? 0 });
    }

    // --- overdueCount ---
    const overdueCount = await this.db.task.count({
      where: {
        workspace_id: workspaceId,
        due_date: { lt: now },
        status: { not: 'COMPLETED' },
      },
    });

    return { statusCounts, workload, completedPerDay, overdueCount };
  }

  async getOverdueTasks(workspaceId: string): Promise<OverdueTaskDto[]> {
    const now = new Date();

    const tasks = await this.db.task.findMany({
      where: {
        workspace_id: workspaceId,
        due_date: { lt: now },
        status: { not: 'COMPLETED' },
      },
      orderBy: { due_date: 'asc' },
      select: {
        task_id: true,
        title: true,
        assignedTo: true,
        due_date: true,
        assignedUser: {
          select: { username: true, name: true },
        },
      },
    });

    return tasks.map((task) => {
      const dueDate = task.due_date as Date;
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / 86_400_000);
      const assigneeName = task.assignedUser
        ? (task.assignedUser.name ?? task.assignedUser.username)
        : null;

      return {
        taskId: task.task_id,
        title: task.title,
        assigneeId: task.assignedTo,
        assignee: assigneeName,
        dueDate: dueDate.toISOString().slice(0, 10),
        daysOverdue,
      };
    });
  }
}
