import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReminderRepository } from '@/contexts/domain/repositories/reminder.repository.port';
import { NotificationRepository } from '@/contexts/domain/repositories/notification.repository.port';

@Injectable()
export class ReminderCronJob {
  constructor(
    @Inject('reminderRepository') private reminderRepository: ReminderRepository,
    @Inject('notificationRepository') private notificationRepository: NotificationRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleReminders(): Promise<void> {
    const due = await this.reminderRepository.findDue();
    for (const reminder of due) {
      void this.notificationRepository.create({
        userId: reminder.user_id,
        notification_type: 'reminder',
        message: `Recordatorio: ${reminder.task?.title ?? 'tarea'}`,
      });
      await this.reminderRepository.markSent(reminder.reminder_id);
    }
  }
}
