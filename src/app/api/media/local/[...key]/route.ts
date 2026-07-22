import { notFound } from "next/navigation";

import { readLocalMedia } from "@/server/media/storage";

const contentTypes: Record<string, string> = {
  avif: "image/avif",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  if (process.env.STORAGE_DRIVER === "s3") notFound();
  const objectKey = (await params).key.join("/");
  const extension = objectKey.split(".").pop() ?? "";
  try {
    const data = await readLocalMedia(objectKey);
    return new Response(data, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentTypes[extension] ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    notFound();
  }
}
