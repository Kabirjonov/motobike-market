import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const locale of ["uz", "ru", "en"] as const) {
  test(`${locale} browse and product route is localized`, async ({ page }) => {
    await page.goto(`/${locale}/catalog`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const product = page.getByRole("link", { name: /QA/ }).first();
    await expect(product).toBeVisible();
    await product.click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/products/`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/QA/);
  });
}

test("storefront has no serious axe violations", async ({ page }) => {
  await page.goto("/uz/catalog");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.filter((item) =>
      ["serious", "critical"].includes(item.impact ?? ""),
    ),
  ).toEqual([]);
});

test("browse to cart and complete guest checkout", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Transactional flow runs once; browsing covers Firefox/mobile",
  );
  await page.goto("/uz/products/qa-test-mototsikl");
  await page.getByRole("button", { name: "Savatga qo‘shish" }).first().click();
  await expect(page.getByText("1 dona savatga qo‘shildi.")).toBeVisible();
  await page.goto("/uz/cart");
  await page.getByRole("link", { name: "Checkout" }).click();
  await page.getByLabel("Ism").fill("Playwright Buyer");
  await page.getByLabel("Telefon").fill("+998901112233");
  await page.getByLabel("Viloyat").fill("Toshkent");
  await page.getByLabel("Shahar").fill("Toshkent");
  await page.getByLabel("Manzil").fill("QA ko‘chasi 1");
  await page.getByRole("button", { name: "Buyurtma berish" }).click();
  await expect(page).toHaveURL(/\/uz\/order-success\/MB-/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
