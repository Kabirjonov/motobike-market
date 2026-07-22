-- Add catalog merchandising fields without changing existing product lifecycle data.
ALTER TABLE "Product"
ADD COLUMN "compareAtPrice" DECIMAL(12,2),
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Product_status_isFeatured_createdAt_idx"
ON "Product"("status", "isFeatured", "createdAt");
