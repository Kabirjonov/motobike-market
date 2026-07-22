ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'CASH_ON_DELIVERY';

CREATE TYPE "DeliveryMethod" AS ENUM ('COURIER', 'PICKUP');

ALTER TABLE "Order"
ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "checkoutFingerprint" TEXT,
ADD COLUMN "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'COURIER';

CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
