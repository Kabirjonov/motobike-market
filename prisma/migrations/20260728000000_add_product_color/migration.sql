CREATE TYPE "ProductColor" AS ENUM (
    'BLACK',
    'WHITE',
    'RED',
    'BLUE',
    'GREEN',
    'YELLOW',
    'ORANGE',
    'GRAY',
    'SILVER',
    'BROWN',
    'GOLD',
    'MULTICOLOR'
);

ALTER TABLE "Product" ADD COLUMN "color" "ProductColor";
