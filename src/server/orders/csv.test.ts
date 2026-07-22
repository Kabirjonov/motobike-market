import { describe, expect, it } from "vitest";

import { escapeCsvCell, safeEmailHref, safePhoneHref } from "./csv";

describe("order export and contact safety", () => {
  it("neutralizes spreadsheet formulas and escapes quotes", () => {
    expect(escapeCsvCell("=1+1")).toBe('"\'=1+1"');
    expect(escapeCsvCell('A "quote"')).toBe('"A ""quote"""');
  });

  it("only creates links for safe contact values", () => {
    expect(safePhoneHref("+998901234567")).toBe("tel:+998901234567");
    expect(safePhoneHref("javascript:alert(1)")).toBeUndefined();
    expect(safeEmailHref("buyer@example.com")).toBe("mailto:buyer@example.com");
    expect(safeEmailHref("bad value")).toBeUndefined();
  });
});
