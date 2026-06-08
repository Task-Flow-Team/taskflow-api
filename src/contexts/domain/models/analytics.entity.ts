export interface StatusCounts {
  OPEN: number;
  IN_PROGRESS: number;
  COMPLETED: number;
}

export interface WorkloadEntry {
  assigneeId: string | null;
  assignee: string;
  openTasks: number;
}

export interface CompletedPerDay {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface WorkspaceSummaryDto {
  statusCounts: StatusCounts;
  workload: WorkloadEntry[];
  completedPerDay: CompletedPerDay[];
  overdueCount: number;
}

export interface OverdueTaskDto {
  taskId: string;
  title: string;
  assigneeId: string | null;
  assignee: string | null;
  dueDate: string;
  daysOverdue: number;
}
