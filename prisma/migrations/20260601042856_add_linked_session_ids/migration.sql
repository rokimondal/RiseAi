/*
  Warnings:

  - A unique constraint covering the columns `[userId,externalJobId]` on the table `AppliedJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AppliedJob_userId_applyLink_key";

-- AlterTable
ALTER TABLE "SimulationSession" ADD COLUMN     "linkedSessionIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "AppliedJob_userId_externalJobId_key" ON "AppliedJob"("userId", "externalJobId");
