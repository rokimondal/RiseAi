/*
  Warnings:

  - A unique constraint covering the columns `[userId,applyLink]` on the table `AppliedJob` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AppliedJob_userId_applyLink_key" ON "AppliedJob"("userId", "applyLink");
