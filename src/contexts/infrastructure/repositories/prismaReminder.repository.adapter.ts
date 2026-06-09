import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { ReminderRepository } from '@/contexts/domain/repositories/reminder.repository.port';
import { Reminder } from '@/contexts/domain/models/reminder.entity';

@Injectable()
export class PrismaReminderRepository implements ReminderRepository {
  constructor(private db: PrismaService) {}

  async create(data: {
    task_id: string;
    user_id: string;
    reminder_time: Date;
    reminder_type?: string;
  }): Promise<Reminder> {
    return this.db.reminders.create({
      data: {
        task_id: data.task_id,
        user_id: data.user_id,
        reminder_time: data.reminder_time,
        reminder_type: data.reminder_type ?? 'datetime',
        is_sent: false,
      },
    }) as Promise<Reminder>;
  }

  async findByUser(userId: string, taskId?: string): Promise<Reminder[]> {
    return this.db.reminders.findMany({
      where: {
        user_id: userId,
        ...(taskId ? { task_id: taskId } : {}),
        is_sent: false,
      },
      orderBy: { reminder_time: 'asc' },
    }) as Promise<Reminder[]>;
  }

  async findDue(): Promise<Reminder[]> {
    return this.db.reminders.findMany({
      where: {
        reminder_time: { lte: new Date() },
        is_sent: false,
      },
      include: { task: { select: { title: true } } },
    }) as Promise<Reminder[]>;
  }

  async markSent(reminderId: string): Promise<void> {
    await this.db.reminders.update({
      where: { reminder_id: reminderId },
      data: { is_sent: true },
    });
  }

  async delete(reminderId: string, userId: string): Promise<void> {
    const reminder = await this.db.reminders.findUnique({
      where: { reminder_id: reminderId },
    });
    if (!reminder || reminder.user_id !== userId) {
      throw new ForbiddenException('Not authorized to delete this reminder');
    }
    await this.db.reminders.delete({ where: { reminder_id: reminderId } });
  }
}
