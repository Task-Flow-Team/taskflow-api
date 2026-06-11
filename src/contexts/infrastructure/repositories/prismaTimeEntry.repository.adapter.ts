import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { TimeEntryRepository } from '@/contexts/domain/repositories/timeEntry.repository.port';
import { TimeEntry } from '@/contexts/domain/models';

@Injectable()
export class PrismaTimeEntryRepository implements TimeEntryRepository {
  constructor(private db: PrismaService) {}

  async create(taskId: string, userId: string): Promise<TimeEntry> {
    return this.db.timeEntry.create({
      data: {
        task_id: taskId,
        user_id: userId,
        start_time: new Date(),
        end_time: null,
      },
    });
  }

  async stop(entryId: string): Promise<TimeEntry> {
    const entry = await this.db.timeEntry.findUnique({ where: { entry_id: entryId } });
    if (!entry) throw new NotFoundException(`TimeEntry with ID ${entryId} not found`);

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - entry.start_time.getTime()) / 1000);

    return this.db.timeEntry.update({
      where: { entry_id: entryId },
      data: {
        end_time: endTime,
        duration,
      },
    });
  }

  async getByTask(taskId: string): Promise<TimeEntry[]> {
    return this.db.timeEntry.findMany({
      where: { task_id: taskId },
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profile_picture_url: true,
          },
        },
      },
    }) as any;
  }

  async getRunning(taskId: string, userId: string): Promise<TimeEntry | null> {
    return this.db.timeEntry.findFirst({
      where: {
        task_id: taskId,
        user_id: userId,
        end_time: null,
      },
    });
  }

  async delete(entryId: string): Promise<void> {
    const entry = await this.db.timeEntry.findUnique({ where: { entry_id: entryId } });
    if (!entry) throw new NotFoundException(`TimeEntry with ID ${entryId} not found`);

    await this.db.timeEntry.delete({
      where: { entry_id: entryId },
    });
  }

  async createManual(taskId: string, userId: string, duration: number, description?: string): Promise<TimeEntry> {
    const now = new Date();
    const startTime = new Date(now.getTime() - duration * 1000);

    return this.db.timeEntry.create({
      data: {
        task_id: taskId,
        user_id: userId,
        start_time: startTime,
        end_time: now,
        duration,
        description: description ?? null,
      },
    });
  }
}
