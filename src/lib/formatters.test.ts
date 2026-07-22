import { describe, expect, it } from "vitest";

import { formatDecimalMoney } from "./formatters";

describe("admin formatters", () => {
  it("formats Decimal strings without Number precision loss", () => {
    const formatted = formatDecimalMoney("900719925474099312345.50", "UZS");

    expect(formatted.replace(/\D/g, "")).toBe("9007199254740993123455");
    expect(formatted).toContain("UZS");
  });

  it("removes insignificant decimal zeroes", () => {
    expect(formatDecimalMoney("12000.00", "UZS")).not.toContain(",00");
  });
});
