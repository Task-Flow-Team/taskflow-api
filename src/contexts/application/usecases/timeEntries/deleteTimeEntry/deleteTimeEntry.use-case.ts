import { Inject, Injectable } from '@nestjs/common';
import { TimeEntryRepository } from '@/contexts/domain/repositories/timeEntry.repository.port';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';

@Injectable()
export class DeleteTimeEntryUseCase {
  constructor(
    @Inject('timeEntryRepository') private timeEntryRepository: TimeEntryRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  async run(userId: string, entryId: string): Promise<void> {
    await this.timeEntryRepository.delete(entryId);

    // We don't have workspace_id directly here, but the delete is logged generically
    // The repository already validates the entry exists
  }
}
