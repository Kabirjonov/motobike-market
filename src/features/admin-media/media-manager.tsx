"use client";

import { ArrowDown, ArrowUp, Star, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { ProductStatus } from "@/generated/prisma/enums";

import {
  deleteImageAction,
  primaryImageAction,
  reorderImagesAction,
  updateAltAction,
  uploadImageAction,
} from "./actions";

type ImageValue = {
  altEn: string | null;
  altRu: string | null;
  altUz: string;
  height: number;
  id: string;
  isPrimary: boolean;
  url: string;
  width: number;
};
export function MediaManager({
  images: initial,
  productId,
  productStatus,
}: {
  images: ImageValue[];
  productId: string;
  productStatus: ProductStatus;
}) {
  const [images, setImages] = useState(initial);
  const upload = uploadImageAction.bind(null, productId);
  const [state, uploadAction, pending] = useActionState(upload, {
    message: "",
  });
  async function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (!images[nextIndex]) return;
    const next = [...images];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setImages(next);
    await reorderImagesAction(
      productId,
      next.map(({ id }) => id),
    );
  }
  return (
    <section className="bg-card border-border grid gap-5 rounded-2xl border p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold">Mahsulot rasmlari</h2>
        <p className="text-muted-foreground text-sm">
          JPEG, PNG, WebP yoki AVIF · 8 MB · 200–6000 px · ko‘pi bilan 20 ta.
        </p>
      </div>
      <form
        action={uploadAction}
        className="grid gap-3 rounded-xl border border-dashed p-4 sm:grid-cols-3"
      >
        <label className="grid gap-1 text-sm font-semibold sm:col-span-3">
          Rasm
          <input
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="border-input rounded-lg border p-2"
            name="file"
            required
            type="file"
          />
        </label>
        {(["altUz", "altRu", "altEn"] as const).map((name) => (
          <label className="grid gap-1 text-sm font-semibold" key={name}>
            {name}
            <input
              className="border-input rounded-lg border px-3 py-2"
              name={name}
              required={name === "altUz"}
            />
          </label>
        ))}
        <div className="sm:col-span-3">
          <Button disabled={pending} type="submit">
            <Upload className="size-4" />
            {pending ? "Yuklanmoqda…" : "Rasm yuklash"}
          </Button>
        </div>
        {state.message ? (
          <p
            aria-live="polite"
            className={
              state.success
                ? "text-primary text-sm font-semibold"
                : "text-destructive text-sm font-semibold"
            }
          >
            {state.message}
          </p>
        ) : null}
      </form>
      {images.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {images.map((image, index) => (
            <li className="overflow-hidden rounded-xl border" key={image.id}>
              <div className="bg-muted relative aspect-[4/3]">
                <Image
                  alt={image.altUz}
                  className="h-full w-full object-contain"
                  height={image.height}
                  sizes="(max-width: 768px) 100vw, 40vw"
                  src={image.url}
                  width={image.width}
                />
                {image.isPrimary ? (
                  <span className="bg-primary text-primary-foreground absolute top-2 left-2 rounded-full px-2 py-1 text-xs font-bold">
                    PRIMARY
                  </span>
                ) : null}
              </div>
              <div className="grid gap-3 p-4">
                <form
                  action={updateAltAction.bind(null, productId, image.id)}
                  className="grid gap-2"
                >
                  <input
                    aria-label="UZ alt text"
                    className="rounded-lg border px-3 py-2 text-sm"
                    defaultValue={image.altUz}
                    name="altUz"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      aria-label="RU alt text"
                      className="rounded-lg border px-3 py-2 text-sm"
                      defaultValue={image.altRu ?? ""}
                      name="altRu"
                    />
                    <input
                      aria-label="EN alt text"
                      className="rounded-lg border px-3 py-2 text-sm"
                      defaultValue={image.altEn ?? ""}
                      name="altEn"
                    />
                  </div>
                  <Button size="sm" type="submit" variant="outline">
                    Alt matnni saqlash
                  </Button>
                </form>
                <div className="flex flex-wrap gap-2">
                  <Button
                    aria-label="Yuqoriga"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    aria-label="Pastga"
                    disabled={index === images.length - 1}
                    onClick={() => move(index, 1)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  {!image.isPrimary ? (
                    <form
                      action={primaryImageAction.bind(
                        null,
                        productId,
                        image.id,
                      )}
                    >
                      <Button size="sm" type="submit" variant="outline">
                        <Star className="size-4" />
                        Primary
                      </Button>
                    </form>
                  ) : null}
                  <form
                    action={deleteImageAction.bind(null, productId, image.id)}
                  >
                    <Button
                      aria-label="Rasmni o‘chirish"
                      disabled={
                        productStatus === ProductStatus.ACTIVE &&
                        images.length === 1
                      }
                      size="icon"
                      type="submit"
                      variant="ghost"
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </form>
                </div>
                <p className="text-muted-foreground text-xs">
                  {image.width}×{image.height}px
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm">
          Hali rasm yuklanmagan. Active qilishdan oldin primary rasm majburiy.
        </p>
      )}
    </section>
  );
}
