import { describe, expect, it } from "vitest";

import { selectLocaleFallback } from "./localization";

describe("locale fallback", () => {
  const items = [
    { locale: "UZ", name: "Uzbek" },
    { locale: "EN", name: "English" },
  ];
  it("prefers requested locale then UZ", () => {
    expect(selectLocaleFallback(items, "EN")?.name).toBe("English");
    expect(selectLocaleFallback(items, "RU")?.name).toBe("Uzbek");
  });
});
