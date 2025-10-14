/*
  Warnings:

  - You are about to drop the column `improvementTips` on the `Assessment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "improvementTips",
ADD COLUMN     "improvementTip" TEXT;
