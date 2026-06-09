import { Inject, Injectable } from '@nestjs/common';
import { ReminderRepository } from '@/contexts/domain/repositories/reminder.repository.port';

@Injectable()
export class DeleteReminderUseCase {
  constructor(
    @Inject('reminderRepository') private reminderRepository: ReminderRepository,
  ) {}

  async run(reminderId: string, userId: string): Promise<void> {
    return this.reminderRepository.delete(reminderId, userId);
  }
}
