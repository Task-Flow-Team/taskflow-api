-- DropIndex (unique on subtask_id, no FK depends on it)
DROP INDEX "Subtasks_subtask_id_key";

-- AlterTable: drop composite PK, add single PK on subtask_id
ALTER TABLE "Subtasks" DROP CONSTRAINT "Subtasks_pkey";
ALTER TABLE "Subtasks" ADD CONSTRAINT "Subtasks_pkey" PRIMARY KEY ("subtask_id");
