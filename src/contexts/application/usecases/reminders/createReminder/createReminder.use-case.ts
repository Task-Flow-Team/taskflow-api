import { Inject, Injectable } from '@nestjs/common';
import { ReminderRepository } from '@/contexts/domain/repositories/reminder.repository.port';
import { Reminder } from '@/contexts/domain/models/reminder.entity';

@Injectable()
export class CreateReminderUseCase {
  constructor(
    @Inject('reminderRepository') private reminderRepository: ReminderRepository,
  ) {}

  async run(userId: string, dto: { task_id: string; reminder_time: string; reminder_type?: string }): Promise<Reminder> {
    return this.reminderRepository.create({
      task_id: dto.task_id,
      user_id: userId,
      reminder_time: new Date(dto.reminder_time),
      reminder_type: dto.reminder_type,
    });
  }
}
