import sharp from "sharp";
import { describe, expect, it } from "vitest";

import {
  detectImageFormat,
  normalizeImageOrder,
  UnsafeImageError,
  validateImageUpload,
} from "@/server/media/image-security";

async function imageFile(width = 800, height = 600) {
  const data = await sharp({
    create: { background: "#c2410c", channels: 3, height, width },
  })
    .webp()
    .toBuffer();
  return new File([data], "untrusted-name.exe", { type: "image/webp" });
}

describe("media upload security", () => {
  it("validates dimensions and creates a random safe key", async () => {
    const result = await validateImageUpload(await imageFile());
    expect(result).toMatchObject({
      contentType: "image/webp",
      height: 600,
      width: 800,
    });
    expect(result.objectKey).toMatch(/^[a-f0-9]{2}\/[a-f0-9-]+\.webp$/);
    expect(result.objectKey).not.toContain("untrusted");
  });
  it("rejects MIME and signature mismatch", async () => {
    const file = new File([Buffer.from([0xff, 0xd8, 0xff, 0x00])], "fake.png", {
      type: "image/png",
    });
    await expect(validateImageUpload(file)).rejects.toBeInstanceOf(
      UnsafeImageError,
    );
  });
  it("rejects undersized decoded images", async () => {
    await expect(
      validateImageUpload(await imageFile(100, 100)),
    ).rejects.toBeInstanceOf(UnsafeImageError);
  });
  it("rejects script signatures", () =>
    expect(
      detectImageFormat(Buffer.from("<script>alert(1)</script>")),
    ).toBeNull());
});

describe("image reorder", () => {
  it("returns contiguous positions", () =>
    expect(normalizeImageOrder(["c", "a", "b"], ["a", "b", "c"])).toEqual([
      { id: "c", sortOrder: 0 },
      { id: "a", sortOrder: 1 },
      { id: "b", sortOrder: 2 },
    ]));
  it("rejects foreign and duplicate ids", () => {
    expect(() => normalizeImageOrder(["a", "a"], ["a", "b"])).toThrow();
    expect(() => normalizeImageOrder(["a", "x"], ["a", "b"])).toThrow();
  });
});
