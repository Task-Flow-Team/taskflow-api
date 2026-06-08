-- AddForeignKey: Subtasks.assignedTo -> User (nullable, SET NULL on delete)
ALTER TABLE "Subtasks" ADD CONSTRAINT "Subtasks_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Subtasks.createdBy -> User
ALTER TABLE "Subtasks" ADD CONSTRAINT "Subtasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
