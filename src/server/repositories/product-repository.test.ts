import { describe, expect, it, vi } from "vitest";

import type { PrismaClient } from "@/generated/prisma/client";
import { Locale, ProductStatus, ProductType } from "@/generated/prisma/enums";

import { ProductRepository } from "./product-repository";

function createDbMock() {
  return {
    product: {
      findMany: vi.fn(),
    },
    productTranslation: {
      findUnique: vi.fn(),
    },
  } as unknown as PrismaClient;
}

describe("ProductRepository", () => {
  it("always limits lists to active, non-archived products", async () => {
    const db = createDbMock();
    vi.mocked(db.product.findMany).mockResolvedValue([]);

    await new ProductRepository(db).listActive({
      limit: 500,
      type: ProductType.MOTORCYCLE,
    });

    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 100,
        where: expect.objectContaining({
          archivedAt: null,
          status: ProductStatus.ACTIVE,
          type: ProductType.MOTORCYCLE,
        }),
      }),
    );
  });

  it("returns null when a translated slug belongs to a non-active product", async () => {
    const db = createDbMock();
    vi.mocked(db.productTranslation.findUnique).mockResolvedValue({
      product: { status: ProductStatus.DRAFT },
    } as never);

    const result = await new ProductRepository(db).findActiveBySlug(
      Locale.UZ,
      "draft-product",
    );

    expect(result).toBeNull();
  });

  it("returns null when an active product was soft-deleted", async () => {
    const db = createDbMock();
    vi.mocked(db.productTranslation.findUnique).mockResolvedValue({
      product: {
        archivedAt: new Date("2026-01-01T00:00:00.000Z"),
        status: ProductStatus.ACTIVE,
      },
    } as never);

    const result = await new ProductRepository(db).findActiveBySlug(
      Locale.UZ,
      "archived-product",
    );

    expect(result).toBeNull();
  });
});
