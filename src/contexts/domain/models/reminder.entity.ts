export interface Reminder {
  reminder_id: string;
  task_id: string;
  user_id: string;
  reminder_time: Date;
  reminder_type?: string;
  is_sent: boolean;
  task?: { title: string };
}
