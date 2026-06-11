import { TaskGroup } from '../models';

export abstract class TaskGroupRepository {
  abstract create(workspaceId: string, name: string, color: string): Promise<TaskGroup>;
  abstract getByWorkspace(workspaceId: string): Promise<TaskGroup[]>;
  abstract getById(groupId: string): Promise<TaskGroup | null>;
  abstract update(groupId: string, data: Partial<TaskGroup>): Promise<TaskGroup>;
  abstract delete(groupId: string): Promise<void>;
}
