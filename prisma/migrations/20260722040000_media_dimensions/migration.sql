-- Existing seeded rows are known demo placeholders; defaults make this additive.
ALTER TABLE "ProductImage"
ADD COLUMN "width" INTEGER NOT NULL DEFAULT 1200,
ADD COLUMN "height" INTEGER NOT NULL DEFAULT 800;

ALTER TABLE "ProductImage"
ALTER COLUMN "width" DROP DEFAULT,
ALTER COLUMN "height" DROP DEFAULT;
