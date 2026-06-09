import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '@/contexts/domain/repositories/task.repository.port';

@Injectable()
export class ExportTasksCsvUseCase {
  constructor(
    @Inject('taskRepository') private taskRepository: TaskRepository,
  ) {}

  async run(workspaceId: string): Promise<string> {
    const tasks = await this.taskRepository.findAllByWorkspace(workspaceId);

    const escapeField = (v: string | null | undefined): string => {
      if (v == null || v === '') return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const header = 'id,title,status,priority,due_date,assignee,created_at';
    const rows = tasks.map(t => [
      t.task_id,
      escapeField(t.title),
      t.status ?? '',
      String(t.priority ?? ''),
      t.due_date ? new Date(t.due_date as string | Date).toISOString().slice(0, 10) : '',
      escapeField(t.assignedTo ?? ''),
      t.created_at ? new Date(t.created_at as string | Date).toISOString().slice(0, 10) : '',
    ].join(','));

    return [header, ...rows].join('\n');
  }
}
