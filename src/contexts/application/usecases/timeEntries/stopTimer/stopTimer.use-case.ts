import { Inject, Injectable } from '@nestjs/common';
import { TimeEntryRepository } from '@/contexts/domain/repositories/timeEntry.repository.port';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { TimeEntry } from '@/contexts/domain/models';

@Injectable()
export class StopTimerUseCase {
  constructor(
    @Inject('timeEntryRepository') private timeEntryRepository: TimeEntryRepository,
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  async run(userId: string, entryId: string): Promise<TimeEntry> {
    const entry = await this.timeEntryRepository.stop(entryId);

    // Get task to find workspace_id for activity logging
    const task = await this.taskRepository.getTaskById(entry.task_id);
    void this.activityLogRepository.logActivity(userId, task.workspace_id, 'timer:stopped');

    return entry;
  }
}
