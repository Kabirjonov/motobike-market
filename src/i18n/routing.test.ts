import { describe, expect, it } from "vitest";

import { isAppLocale, localePath, routing } from "./routing";

describe("localized routes", () => {
  it("defines all locale roots and default UZ", () => {
    expect(routing.locales).toEqual(["uz", "ru", "en"]);
    expect(routing.defaultLocale).toBe("uz");
  });

  it("removes locale prefixes from public URLs", () => {
    expect(localePath("ru", "/uz/catalog")).toBe("/catalog");
    expect(localePath("en", "/ru/products/demo")).toBe("/products/demo");
    expect(localePath("uz", "/catalog")).toBe("/catalog");
    expect(isAppLocale("de")).toBe(false);
  });
});
