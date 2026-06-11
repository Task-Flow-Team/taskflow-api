export interface TimeEntry {
  entry_id: string;
  task_id: string;
  user_id: string;
  start_time: Date;
  end_time: Date | null;
  duration: number | null;
  description: string | null;
  created_at: Date;
}
