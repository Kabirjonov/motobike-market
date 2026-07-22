import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "argon2";
import { z } from "zod";

import { PrismaClient } from "../src/generated/prisma/client";
import {
  AdminRole,
  Locale,
  ProductCondition,
  ProductStatus,
  ProductType,
} from "../src/generated/prisma/enums";

const seedEnvSchema = z.object({
  DATABASE_URL: z.url(),
  NODE_ENV: z.enum(["development", "test"]).default("development"),
  SEED_ADMIN_EMAIL: z.email().transform((value) => value.toLowerCase()),
  SEED_ADMIN_PASSWORD: z.string().min(12),
});

const env = seedEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

type Translation = {
  description: string;
  locale: Locale;
  name: string;
  slug: string;
};

async function upsertCategory(sortOrder: number, translations: Translation[]) {
  const uz = translations.find(({ locale }) => locale === Locale.UZ);

  if (!uz) {
    throw new Error("Every seeded category requires an Uzbek translation");
  }

  const existing = await prisma.categoryTranslation.findUnique({
    where: { locale_slug: { locale: Locale.UZ, slug: uz.slug } },
    select: { categoryId: true },
  });

  const category = existing
    ? await prisma.category.update({
        where: { id: existing.categoryId },
        data: { archivedAt: null, isActive: true, sortOrder },
      })
    : await prisma.category.create({ data: { sortOrder } });

  for (const translation of translations) {
    await prisma.categoryTranslation.upsert({
      where: {
        categoryId_locale: {
          categoryId: category.id,
          locale: translation.locale,
        },
      },
      create: { categoryId: category.id, ...translation },
      update: translation,
    });
  }

  return category;
}

async function upsertProduct(input: {
  brandId?: string;
  categoryId: string;
  compatibility?: {
    engineCc?: number;
    make: string;
    model: string;
    yearFrom?: number;
    yearTo?: number;
  }[];
  condition?: ProductCondition;
  imageSlug: string;
  motorcycle?: {
    engineCc: number;
    make: string;
    mileageKm: number;
    model: string;
    year: number;
  };
  partNumber?: string;
  price: string;
  compareAtPrice?: string;
  isFeatured?: boolean;
  sku: string;
  stock: number;
  translations: Translation[];
  type: ProductType;
}) {
  const product = await prisma.product.upsert({
    where: { sku: input.sku },
    create: {
      brandId: input.brandId,
      categoryId: input.categoryId,
      condition: input.condition,
      currency: "UZS",
      price: input.price,
      compareAtPrice: input.compareAtPrice,
      isFeatured: input.isFeatured ?? false,
      sku: input.sku,
      status: ProductStatus.ACTIVE,
      stock: input.stock,
      type: input.type,
    },
    update: {
      archivedAt: null,
      brandId: input.brandId,
      categoryId: input.categoryId,
      condition: input.condition,
      price: input.price,
      compareAtPrice: input.compareAtPrice,
      isFeatured: input.isFeatured ?? false,
      status: ProductStatus.ACTIVE,
      stock: input.stock,
      type: input.type,
    },
  });

  for (const translation of input.translations) {
    await prisma.productTranslation.upsert({
      where: {
        productId_locale: {
          locale: translation.locale,
          productId: product.id,
        },
      },
      create: { productId: product.id, ...translation },
      update: translation,
    });
  }

  await prisma.productImage.upsert({
    where: { objectKey: `demo/${input.imageSlug}.webp` },
    create: {
      altUz: input.translations[0]?.name ?? input.sku,
      isPrimary: true,
      width: 1200,
      height: 800,
      objectKey: `demo/${input.imageSlug}.webp`,
      productId: product.id,
      url: `/demo/${input.imageSlug}.webp`,
    },
    update: {
      altUz: input.translations[0]?.name ?? input.sku,
      isPrimary: true,
      width: 1200,
      height: 800,
      productId: product.id,
      url: `/demo/${input.imageSlug}.webp`,
    },
  });

  if (input.motorcycle) {
    await prisma.motorcycleSpec.upsert({
      where: { productId: product.id },
      create: { productId: product.id, ...input.motorcycle },
      update: input.motorcycle,
    });
  }

  if (input.partNumber) {
    await prisma.partSpec.upsert({
      where: { productId: product.id },
      create: { partNumber: input.partNumber, productId: product.id },
      update: { partNumber: input.partNumber },
    });
  }

  await prisma.productCompatibility.deleteMany({
    where: { productId: product.id },
  });

  if (input.compatibility?.length) {
    await prisma.productCompatibility.createMany({
      data: input.compatibility.map((compatibility) => ({
        ...compatibility,
        productId: product.id,
      })),
    });
  }
}

async function main() {
  const passwordHash = await hash(env.SEED_ADMIN_PASSWORD, {
    memoryCost: 19456,
    parallelism: 1,
    timeCost: 2,
  });

  await prisma.adminUser.upsert({
    where: { email: env.SEED_ADMIN_EMAIL },
    create: {
      email: env.SEED_ADMIN_EMAIL,
      name: "Development Admin",
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
    update: {
      deletedAt: null,
      isActive: true,
      name: "Development Admin",
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  const [motorcycles, parts, accessories, gear] = await Promise.all([
    upsertCategory(10, [
      {
        locale: Locale.UZ,
        slug: "mototsikllar",
        name: "Mototsikllar",
        description: "Shahar va sayohat uchun mototsikllar.",
      },
      {
        locale: Locale.RU,
        slug: "motocikly",
        name: "Мотоциклы",
        description: "Мотоциклы для города и путешествий.",
      },
      {
        locale: Locale.EN,
        slug: "motorcycles",
        name: "Motorcycles",
        description: "Motorcycles for city rides and touring.",
      },
    ]),
    upsertCategory(20, [
      {
        locale: Locale.UZ,
        slug: "ehtiyot-qismlar",
        name: "Ehtiyot qismlar",
        description: "Texnik xizmat va ta’mirlash qismlari.",
      },
      {
        locale: Locale.RU,
        slug: "zapchasti",
        name: "Запчасти",
        description: "Детали для обслуживания и ремонта.",
      },
      {
        locale: Locale.EN,
        slug: "parts",
        name: "Parts",
        description: "Parts for maintenance and repair.",
      },
    ]),
    upsertCategory(30, [
      {
        locale: Locale.UZ,
        slug: "aksessuarlar",
        name: "Aksessuarlar",
        description: "Kundalik haydash uchun qulay aksessuarlar.",
      },
      {
        locale: Locale.RU,
        slug: "aksessuary",
        name: "Аксессуары",
        description: "Практичные аксессуары для ежедневных поездок.",
      },
      {
        locale: Locale.EN,
        slug: "accessories",
        name: "Accessories",
        description: "Practical accessories for everyday riding.",
      },
    ]),
    upsertCategory(40, [
      {
        locale: Locale.UZ,
        slug: "ekipirovka",
        name: "Ekipirovka",
        description: "Haydovchi xavfsizligi uchun kiyim va himoya.",
      },
      {
        locale: Locale.RU,
        slug: "ekipirovka",
        name: "Экипировка",
        description: "Одежда и защита для безопасности райдера.",
      },
      {
        locale: Locale.EN,
        slug: "gear",
        name: "Gear",
        description: "Apparel and protection for rider safety.",
      },
    ]),
  ]);

  const [yamaha, motul, givi, ls2] = await Promise.all(
    [
      ["Yamaha", "yamaha", "https://www.yamaha-motor.eu"],
      ["Motul", "motul", "https://www.motul.com"],
      ["Givi", "givi", "https://www.givi.it"],
      ["LS2", "ls2", "https://ls2helmets.com"],
    ].map(([name, slug, websiteUrl]) =>
      prisma.brand.upsert({
        where: { slug },
        create: { name, slug, websiteUrl },
        update: { archivedAt: null, isActive: true, name, websiteUrl },
      }),
    ),
  );

  await upsertProduct({
    brandId: yamaha.id,
    categoryId: motorcycles.id,
    condition: ProductCondition.NEW,
    imageSlug: "yamaha-mt-07-2025",
    motorcycle: {
      engineCc: 689,
      make: "Yamaha",
      mileageKm: 0,
      model: "MT-07",
      year: 2025,
    },
    price: "128000000.00",
    sku: "MOTO-YAM-MT07-2025",
    stock: 2,
    translations: [
      {
        locale: Locale.UZ,
        slug: "yamaha-mt-07-2025",
        name: "Yamaha MT-07 2025",
        description:
          "689 cc parallel-twin dvigatelli yengil va chaqqon shahar mototsikli.",
      },
      {
        locale: Locale.RU,
        slug: "yamaha-mt-07-2025",
        name: "Yamaha MT-07 2025",
        description:
          "Лёгкий городской мотоцикл с рядным двухцилиндровым двигателем 689 куб. см.",
      },
      {
        locale: Locale.EN,
        slug: "yamaha-mt-07-2025",
        name: "Yamaha MT-07 2025",
        description:
          "A lightweight, agile roadster powered by a 689 cc parallel twin.",
      },
    ],
    type: ProductType.MOTORCYCLE,
  });

  await upsertProduct({
    brandId: motul.id,
    categoryId: parts.id,
    compatibility: [
      {
        engineCc: 689,
        make: "Yamaha",
        model: "MT-07",
        yearFrom: 2018,
        yearTo: 2025,
      },
      {
        engineCc: 689,
        make: "Yamaha",
        model: "XSR700",
        yearFrom: 2018,
        yearTo: 2025,
      },
    ],
    condition: ProductCondition.NEW,
    imageSlug: "motul-7100-10w40",
    partNumber: "104091",
    price: "245000.00",
    sku: "PART-MOT-7100-10W40-1L",
    stock: 48,
    translations: [
      {
        locale: Locale.UZ,
        slug: "motul-7100-10w40-1l",
        name: "Motul 7100 10W-40 1L",
        description: "4-takt mototsikllar uchun to‘liq sintetik motor moyi.",
      },
      {
        locale: Locale.RU,
        slug: "motul-7100-10w40-1l",
        name: "Motul 7100 10W-40 1 л",
        description:
          "Полностью синтетическое масло для четырёхтактных мотоциклов.",
      },
      {
        locale: Locale.EN,
        slug: "motul-7100-10w40-1l",
        name: "Motul 7100 10W-40 1L",
        description: "Fully synthetic engine oil for four-stroke motorcycles.",
      },
    ],
    type: ProductType.PART,
  });

  await upsertProduct({
    brandId: givi.id,
    categoryId: accessories.id,
    condition: ProductCondition.NEW,
    imageSlug: "givi-b47-top-case",
    price: "2890000.00",
    sku: "ACC-GIVI-B47NML",
    stock: 7,
    translations: [
      {
        locale: Locale.UZ,
        slug: "givi-b47-blade-top-case",
        name: "Givi B47 Blade top case",
        description:
          "Ikki dona integral shlem sig‘adigan 47 litrlik qattiq bagaj.",
      },
      {
        locale: Locale.RU,
        slug: "givi-b47-blade-top-case",
        name: "Кофр Givi B47 Blade",
        description:
          "Жёсткий кофр объёмом 47 литров для двух интегральных шлемов.",
      },
      {
        locale: Locale.EN,
        slug: "givi-b47-blade-top-case",
        name: "Givi B47 Blade top case",
        description:
          "A 47-litre hard case with room for two full-face helmets.",
      },
    ],
    type: ProductType.ACCESSORY,
  });

  await upsertProduct({
    brandId: ls2.id,
    categoryId: gear.id,
    condition: ProductCondition.NEW,
    imageSlug: "ls2-ff800-storm-ii",
    price: "2150000.00",
    sku: "GEAR-LS2-FF800-BLK-M",
    stock: 12,
    translations: [
      {
        locale: Locale.UZ,
        slug: "ls2-ff800-storm-ii-shlem",
        name: "LS2 FF800 Storm II shlemi",
        description:
          "Pinlock-ready vizorli, ECE 22.06 sertifikatli integral shlem.",
      },
      {
        locale: Locale.RU,
        slug: "shlem-ls2-ff800-storm-ii",
        name: "Шлем LS2 FF800 Storm II",
        description:
          "Интегральный шлем ECE 22.06 с визором, подготовленным под Pinlock.",
      },
      {
        locale: Locale.EN,
        slug: "ls2-ff800-storm-ii-helmet",
        name: "LS2 FF800 Storm II helmet",
        description: "ECE 22.06 full-face helmet with a Pinlock-ready visor.",
      },
    ],
    type: ProductType.GEAR,
  });

  await prisma.siteSetting.upsert({
    where: { key_locale: { key: "store.contact", locale: Locale.UZ } },
    create: {
      description: "Development storefront contact placeholder",
      isPublic: true,
      key: "store.contact",
      locale: Locale.UZ,
      value: { phone: "+998 00 000 00 00" },
    },
    update: { value: { phone: "+998 00 000 00 00" } },
  });
}

main()
  .then(() => {
    console.info("Development seed completed successfully.");
  })
  .catch((error: unknown) => {
    console.error("Development seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
