/*
  Warnings:

  - The values [NEGETIVE] on the enum `MarketOutlook` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[sessionId]` on the table `SimulationResult` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sessionToken]` on the table `SimulationSession` will be added. If there are existing duplicate values, this will fail.
  - The required column `sessionToken` was added to the `SimulationSession` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('BONUS', 'PURCHASE', 'USAGE', 'REFUND', 'ADMIN_ADDED');

-- AlterEnum
BEGIN;
CREATE TYPE "MarketOutlook_new" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');
ALTER TABLE "IndustryInsight" ALTER COLUMN "marketOutlook" TYPE "MarketOutlook_new" USING ("marketOutlook"::text::"MarketOutlook_new");
ALTER TYPE "MarketOutlook" RENAME TO "MarketOutlook_old";
ALTER TYPE "MarketOutlook_new" RENAME TO "MarketOutlook";
DROP TYPE "public"."MarketOutlook_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "AppliedJob" DROP CONSTRAINT "AppliedJob_userId_fkey";

-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_userId_fkey";

-- DropForeignKey
ALTER TABLE "CoverLetter" DROP CONSTRAINT "CoverLetter_userId_fkey";

-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_userId_fkey";

-- DropForeignKey
ALTER TABLE "SimulationResult" DROP CONSTRAINT "SimulationResult_userId_fkey";

-- DropForeignKey
ALTER TABLE "SimulationSession" DROP CONSTRAINT "SimulationSession_userId_fkey";

-- AlterTable
ALTER TABLE "SimulationResult" ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "SimulationSession" ADD COLUMN     "autoSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "sessionToken" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 20;

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "externalPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationResult_sessionId_key" ON "SimulationResult"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationSession_sessionToken_key" ON "SimulationSession"("sessionToken");

-- CreateIndex
CREATE INDEX "SimulationSession_expiresAt_idx" ON "SimulationSession"("expiresAt");

-- CreateIndex
CREATE INDEX "SimulationSession_type_idx" ON "SimulationSession"("type");

-- CreateIndex
CREATE INDEX "SimulationSession_status_expiresAt_idx" ON "SimulationSession"("status", "expiresAt");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverLetter" ADD CONSTRAINT "CoverLetter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppliedJob" ADD CONSTRAINT "AppliedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationSession" ADD CONSTRAINT "SimulationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationResult" ADD CONSTRAINT "SimulationResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SimulationSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationResult" ADD CONSTRAINT "SimulationResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
