import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { TimeEntryRepository } from '@/contexts/domain/repositories/timeEntry.repository.port';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { TimeEntry } from '@/contexts/domain/models';

@Injectable()
export class StartTimerUseCase {
  constructor(
    @Inject('timeEntryRepository') private timeEntryRepository: TimeEntryRepository,
    @Inject('taskRepository') private taskRepository: TaskRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  async run(userId: string, taskId: string): Promise<TimeEntry> {
    // Check if user already has a running timer on this task
    const running = await this.timeEntryRepository.getRunning(taskId, userId);
    if (running) throw new BadRequestException('Timer already running for this task');

    const entry = await this.timeEntryRepository.create(taskId, userId);

    // Get task to find workspace_id for activity logging
    const task = await this.taskRepository.getTaskById(taskId);
    void this.activityLogRepository.logActivity(userId, task.workspace_id, 'timer:started');

    return entry;
  }
}
