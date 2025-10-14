/*
  Warnings:

  - You are about to drop the column `keyTrands` on the `IndustryInsight` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IndustryInsight" DROP COLUMN "keyTrands",
ADD COLUMN     "keyTrends" TEXT[];
