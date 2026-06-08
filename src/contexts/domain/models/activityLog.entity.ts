export interface ActivityLog {
  log_id: string;
  user_id: string;
  workspace_id: string;
  action: string;
  timestamp: Date;
}
