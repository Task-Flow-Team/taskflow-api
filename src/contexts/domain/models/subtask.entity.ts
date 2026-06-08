import { TaskStatus } from "@/contexts/shared/lib/types";

export interface SubTask {
    subtask_id: string,
    task_id: string,
    createdBy: string,
    title: string,
    description: string | null,
    status: TaskStatus,
    priority: number,
    created_at: Date,
    updated_at: Date,
    due_at: Date | null,
    completed_at: Date | null,
    assignedTo: string | null
}