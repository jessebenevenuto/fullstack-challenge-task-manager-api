/*
  Warnings:

  - The primary key for the `team_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `team_members` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,team_id]` on the table `team_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `teams` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_pkey",
DROP COLUMN "id",
DROP COLUMN "updated_at";

-- CreateIndex
CREATE UNIQUE INDEX "team_members_user_id_team_id_key" ON "team_members"("user_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");
