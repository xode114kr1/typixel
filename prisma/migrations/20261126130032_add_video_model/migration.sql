-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PENDING_UPLOAD', 'READY', 'FAILED', 'DELETING', 'EXPIRED');

-- CreateTable
CREATE TABLE "video" (
    "id" TEXT NOT NULL,
    "shareId" TEXT,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "status" "VideoStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "sizeBytes" BIGINT NOT NULL,
    "duration" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_shareId_key" ON "video"("shareId");

-- CreateIndex
CREATE UNIQUE INDEX "video_storageKey_key" ON "video"("storageKey");

-- CreateIndex
CREATE INDEX "video_ownerId_createdAt_idx" ON "video"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "video_status_idx" ON "video"("status");

-- CreateIndex
CREATE INDEX "video_expiresAt_idx" ON "video"("expiresAt");

-- AddForeignKey
ALTER TABLE "video" ADD CONSTRAINT "video_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
