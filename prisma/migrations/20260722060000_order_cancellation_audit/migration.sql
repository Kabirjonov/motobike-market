ALTER TABLE "Order" ADD COLUMN "stockRestoredAt" TIMESTAMP(3);

CREATE INDEX "Order_stockRestoredAt_idx" ON "Order"("stockRestoredAt");
