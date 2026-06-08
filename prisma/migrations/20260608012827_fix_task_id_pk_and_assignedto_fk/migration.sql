-- Drop FK constraints that depend on Task_task_id_key unique index
ALTER TABLE "Subtasks" DROP CONSTRAINT "Subtasks_task_id_fkey";
ALTER TABLE "TaskTags" DROP CONSTRAINT "TaskTags_task_id_fkey";
ALTER TABLE "Reminders" DROP CONSTRAINT "Reminders_task_id_fkey";

-- DropIndex (now safe)
DROP INDEX "Task_task_id_key";

-- AlterTable: promote task_id to primary key
ALTER TABLE "Task" ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("task_id");

-- Re-add FK constraints (now referencing the PK)
ALTER TABLE "Subtasks" ADD CONSTRAINT "Subtasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaskTags" ADD CONSTRAINT "TaskTags_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reminders" ADD CONSTRAINT "Reminders_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: assignedTo -> User
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
