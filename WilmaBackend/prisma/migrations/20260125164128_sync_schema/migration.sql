/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Organisation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Organisation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IngestionStatus" AS ENUM ('PENDING', 'ANALYZED', 'CALIBRATED');

-- DropIndex
DROP INDEX "Organisation_rootUrl_key";

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "screeningData" JSONB;

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "branding" JSONB,
ADD COLUMN     "cultureValues" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "ingestionStatus" "IngestionStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "techStack" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_slug_key" ON "Organisation"("slug");
