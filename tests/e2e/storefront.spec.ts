import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const locale of ["uz", "ru", "en"] as const) {
  test(`${locale} preference localizes clean product routes`, async ({
    page,
  }) => {
    await page.addInitScript((selectedLocale) => {
      window.localStorage.setItem("locale", selectedLocale);
      document.cookie = `NEXT_LOCALE=${selectedLocale}; path=/; SameSite=Lax`;
    }, locale);
    await page.goto("/catalog");
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const product = page.getByRole("link", { name: /QA/ }).first();
    await expect(product).toBeVisible();
    await product.click();
    await expect(page).toHaveURL(/\/products\//);
    await expect(page).not.toHaveURL(new RegExp(`/${locale}/`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/QA/);
  });
}

test("storefront has no serious axe violations", async ({ page }) => {
  await page.goto("/catalog");
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
  await page.goto("/products/qa-test-mototsikl");
  await page.getByRole("button", { name: "Savatga qo‘shish" }).first().click();
  await expect(page.getByText("1 dona savatga qo‘shildi.")).toBeVisible();
  await page.goto("/cart");
  await page.getByRole("link", { name: "Checkout" }).click();
  await page.getByLabel("Ism").fill("Playwright Buyer");
  await page.getByLabel("Telefon").fill("+998901112233");
  await page.getByLabel("Viloyat").selectOption("Toshkent shahri");
  await page.getByLabel("Shahar / tuman").selectOption("Chilonzor tumani");
  await page.getByLabel("Manzil").fill("QA ko‘chasi 1");
  await page.getByRole("button", { name: "Buyurtma berish" }).click();
  await expect(page).toHaveURL(/\/order-success\/MB-/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
