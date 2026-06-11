import { TimeEntry } from '../models';

export abstract class TimeEntryRepository {
  abstract create(taskId: string, userId: string): Promise<TimeEntry>;
  abstract stop(entryId: string): Promise<TimeEntry>;
  abstract getByTask(taskId: string): Promise<TimeEntry[]>;
  abstract getRunning(taskId: string, userId: string): Promise<TimeEntry | null>;
  abstract delete(entryId: string): Promise<void>;
  abstract createManual(taskId: string, userId: string, duration: number, description?: string): Promise<TimeEntry>;
}
