import { describe, expect, it } from "vitest";

import { isAppLocale, localePath, routing } from "./routing";

describe("localized routes", () => {
  it("defines all locale roots and default UZ", () => {
    expect(routing.locales).toEqual(["uz", "ru", "en"]);
    expect(routing.defaultLocale).toBe("uz");
  });

  it("switches locale without duplicating prefixes", () => {
    expect(localePath("ru", "/uz/catalog")).toBe("/ru/catalog");
    expect(localePath("en", "/ru/products/demo")).toBe("/en/products/demo");
    expect(isAppLocale("de")).toBe(false);
  });
});
