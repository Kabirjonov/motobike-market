import { expect, test } from "@playwright/test";

test("admin login, draft product CRUD and order transition", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Stateful admin flow runs once",
  );
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(process.env.SEED_ADMIN_EMAIL!);
  await page.getByLabel("Parol").fill(process.env.SEED_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Admin panelga kirish" }).click();
  await expect(page).toHaveURL(/\/(?:uz\/)?admin$/);

  await page.goto("/admin/products/new");
  await page.getByLabel("SKU").fill("E2E-DRAFT-001");
  await page.getByLabel("Mahsulot turi").selectOption("ACCESSORY");
  await page.getByLabel("Kategoriya").selectOption({ index: 1 });
  await page.getByLabel("Narx", { exact: true }).fill("50000.00");
  await page.getByLabel("Stock").first().fill("3");
  for (const [locale, suffix] of [
    ["UZ", "uz"],
    ["RU", "ru"],
    ["EN", "en"],
  ] as const) {
    const group = page.getByRole("group", { name: locale });
    await group.getByLabel("Nomi").fill(`E2E Product ${locale}`);
    await group.getByLabel("Slug").fill(`e2e-product-${suffix}`);
    await group.getByLabel("Tavsif").fill(`E2E product description ${locale}`);
  }
  await page.getByRole("button", { name: "Mahsulotni saqlash" }).click();
  await expect(page).toHaveURL(/\/admin\/products\/.+\?saved=1/);
  await page.getByLabel("Stock").first().fill("4");
  await page.getByRole("button", { name: "Mahsulotni saqlash" }).click();
  await expect(page.getByRole("status")).toContainText("Mahsulot saqlandi");

  await page.goto("/admin/orders");
  await page.getByRole("link", { name: "QA-E2E-ORDER" }).click();
  await page.getByLabel("Yangi status").selectOption("CONFIRMED");
  await page.getByLabel("Audit izohi").fill("Confirmed by Playwright QA");
  await page.getByRole("button", { name: "Statusni yangilash" }).click();
  await expect(page.getByRole("status")).toContainText("audit tarixi");
});
