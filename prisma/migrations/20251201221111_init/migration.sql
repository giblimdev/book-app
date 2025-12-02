-- AlterTable
ALTER TABLE "node_contents" ADD COLUMN     "imageId" TEXT,
ALTER COLUMN "content" SET DEFAULT 'a rédiger',
ALTER COLUMN "content" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "node_contents" ADD CONSTRAINT "node_contents_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
