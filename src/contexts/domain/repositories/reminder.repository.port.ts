import { Reminder } from '../models/reminder.entity';

export abstract class ReminderRepository {
  abstract create(data: {
    task_id: string;
    user_id: string;
    reminder_time: Date;
    reminder_type?: string;
  }): Promise<Reminder>;

  abstract findByUser(userId: string, taskId?: string): Promise<Reminder[]>;

  abstract findDue(): Promise<Reminder[]>;

  abstract markSent(reminderId: string): Promise<void>;

  abstract delete(reminderId: string, userId: string): Promise<void>;
}
