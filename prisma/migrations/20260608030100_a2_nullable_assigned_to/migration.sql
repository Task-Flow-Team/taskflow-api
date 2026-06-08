-- AlterTable: make assignedTo nullable on Task
ALTER TABLE "Task" ALTER COLUMN "assignedTo" DROP NOT NULL;

-- AlterTable: make assignedTo nullable on Subtasks
ALTER TABLE "Subtasks" ALTER COLUMN "assignedTo" DROP NOT NULL;
