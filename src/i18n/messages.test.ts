import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import uz from "@/messages/uz.json";

function keys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object") return [prefix];
  return Object.entries(value)
    .flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

describe("i18n messages", () => {
  it("keeps UZ, RU and EN message keys identical", () => {
    expect(keys(ru)).toEqual(keys(uz));
    expect(keys(en)).toEqual(keys(uz));
  });
});
