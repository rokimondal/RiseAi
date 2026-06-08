-- AlterTable
ALTER TABLE "SimulationSession" ADD COLUMN     "parentSessionId" TEXT;

-- CreateIndex
CREATE INDEX "SimulationSession_parentSessionId_idx" ON "SimulationSession"("parentSessionId");
