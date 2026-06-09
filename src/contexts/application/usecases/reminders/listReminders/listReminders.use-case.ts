import { Inject, Injectable } from '@nestjs/common';
import { ReminderRepository } from '@/contexts/domain/repositories/reminder.repository.port';
import { Reminder } from '@/contexts/domain/models/reminder.entity';

@Injectable()
export class ListRemindersUseCase {
  constructor(
    @Inject('reminderRepository') private reminderRepository: ReminderRepository,
  ) {}

  async run(userId: string, taskId?: string): Promise<Reminder[]> {
    return this.reminderRepository.findByUser(userId, taskId);
  }
}
