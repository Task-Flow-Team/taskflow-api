import { TaskStatus } from "@/contexts/shared/lib/types"

export interface Task {
    task_id: string,
    createdBy: string,
    workspace_id: string,
    title: string,
    description: string | null
    status: TaskStatus,
    priority: number,
    created_at: Date,
    updated_at: Date,
    due_date: Date | null,
    completed_at: Date | null,
    assignedTo: string | null
}

export type CreateTaskBody = Pick<Task, 'title' | 'workspace_id'> & Partial<Pick<Task, 'description' | 'status' | 'priority' | 'assignedTo' | 'due_date'>>;