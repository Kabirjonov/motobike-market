import { randomUUID } from "node:crypto";

import sharp, { type Metadata } from "sharp";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 6000;
export const MIN_IMAGE_DIMENSION = 200;
const formats = {
  jpeg: { contentType: "image/jpeg", extension: "jpg" },
  png: { contentType: "image/png", extension: "png" },
  webp: { contentType: "image/webp", extension: "webp" },
  avif: { contentType: "image/avif", extension: "avif" },
} as const;

export class UnsafeImageError extends Error {}

export function detectImageFormat(bytes: Uint8Array) {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
    return "jpeg";
  if (
    bytes.length >= 8 &&
    Buffer.from(bytes.subarray(0, 8)).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    )
  )
    return "png";
  if (
    bytes.length >= 12 &&
    Buffer.from(bytes.subarray(0, 4)).toString() === "RIFF" &&
    Buffer.from(bytes.subarray(8, 12)).toString() === "WEBP"
  )
    return "webp";
  if (
    bytes.length >= 12 &&
    Buffer.from(bytes.subarray(4, 12)).toString().includes("ftypavif")
  )
    return "avif";
  return null;
}

export async function validateImageUpload(file: File) {
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES)
    throw new UnsafeImageError("Rasm hajmi 8 MB dan oshmasligi kerak.");
  const data = Buffer.from(await file.arrayBuffer());
  const format = detectImageFormat(data);
  if (!format || formats[format].contentType !== file.type)
    throw new UnsafeImageError("Fayl MIME turi va haqiqiy formati mos emas.");
  let metadata: Metadata;
  try {
    metadata = await sharp(data, {
      limitInputPixels: MAX_IMAGE_DIMENSION ** 2,
    }).metadata();
  } catch {
    throw new UnsafeImageError(
      "Rasm dekodlanmadi yoki xavfsizlik limitidan oshdi.",
    );
  }
  const decodedFormat = format === "avif" ? "heif" : format;
  if (metadata.format !== decodedFormat || !metadata.width || !metadata.height)
    throw new UnsafeImageError("Rasm formati yoki dimensions aniqlanmadi.");
  if (
    metadata.width < MIN_IMAGE_DIMENSION ||
    metadata.height < MIN_IMAGE_DIMENSION ||
    metadata.width > MAX_IMAGE_DIMENSION ||
    metadata.height > MAX_IMAGE_DIMENSION
  )
    throw new UnsafeImageError(
      `Rasm o‘lchami ${MIN_IMAGE_DIMENSION}–${MAX_IMAGE_DIMENSION}px oralig‘ida bo‘lishi kerak.`,
    );
  let sanitized: Buffer;
  let output: { width: number; height: number };
  try {
    const result = await sharp(data, {
      limitInputPixels: MAX_IMAGE_DIMENSION ** 2,
    })
      .rotate()
      .webp({ quality: 85, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    sanitized = result.data;
    output = { width: result.info.width, height: result.info.height };
  } catch {
    throw new UnsafeImageError("Rasmni xavfsiz formatga o‘tkazib bo‘lmadi.");
  }
  const objectKey = `${randomUUID().slice(0, 2)}/${randomUUID()}.webp`;
  return {
    contentType: "image/webp",
    data: sanitized,
    height: output.height,
    objectKey,
    width: output.width,
  };
}

export function normalizeImageOrder(imageIds: string[], existingIds: string[]) {
  if (
    imageIds.length !== existingIds.length ||
    new Set(imageIds).size !== imageIds.length ||
    imageIds.some((id) => !existingIds.includes(id))
  )
    throw new Error("Invalid image order");
  return imageIds.map((id, sortOrder) => ({ id, sortOrder }));
}
