-- CreateIndex: Task
CREATE INDEX "Task_workspace_id_idx" ON "Task"("workspace_id");
CREATE INDEX "Task_assignedTo_idx" ON "Task"("assignedTo");
CREATE INDEX "Task_createdBy_idx" ON "Task"("createdBy");

-- CreateIndex: WorkspaceCollaborator
CREATE INDEX "WorkspaceCollaborator_collaborator_id_idx" ON "WorkspaceCollaborator"("collaborator_id");

-- CreateIndex: Subtasks
CREATE INDEX "Subtasks_task_id_idx" ON "Subtasks"("task_id");
CREATE INDEX "Subtasks_assignedTo_idx" ON "Subtasks"("assignedTo");

-- CreateIndex: Tags
CREATE INDEX "Tags_workspace_id_idx" ON "Tags"("workspace_id");

-- CreateIndex: Notifications
CREATE INDEX "Notifications_user_id_idx" ON "Notifications"("user_id");

-- CreateIndex: ActivityLogs
CREATE INDEX "ActivityLogs_workspace_id_idx" ON "ActivityLogs"("workspace_id");
CREATE INDEX "ActivityLogs_user_id_idx" ON "ActivityLogs"("user_id");
