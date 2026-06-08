export interface Notification {
  notification_id: string;
  user_id: string;
  notification_type: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}
