/*
  Warnings:

  - You are about to drop the column `sessionId` on the `SimulationSession` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `SimulationSession` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('STARTED', 'SUBMITTED', 'EXPIRED');

-- DropIndex
DROP INDEX "SimulationSession_sessionId_key";

-- AlterTable
ALTER TABLE "SimulationSession" DROP COLUMN "sessionId",
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" "SessionStatus" NOT NULL DEFAULT 'STARTED',
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "SimulationSession_status_idx" ON "SimulationSession"("status");
