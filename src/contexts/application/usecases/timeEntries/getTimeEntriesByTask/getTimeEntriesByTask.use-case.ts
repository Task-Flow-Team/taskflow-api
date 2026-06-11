import { Inject, Injectable } from '@nestjs/common';
import { TimeEntryRepository } from '@/contexts/domain/repositories/timeEntry.repository.port';
import { TimeEntry } from '@/contexts/domain/models';

@Injectable()
export class GetTimeEntriesByTaskUseCase {
  constructor(
    @Inject('timeEntryRepository') private timeEntryRepository: TimeEntryRepository,
  ) {}

  async run(taskId: string): Promise<TimeEntry[]> {
    return this.timeEntryRepository.getByTask(taskId);
  }
}
