"use client";

import { Bike } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type GalleryImage = {
  alt: string;
  height: number;
  id: string;
  url: string;
  width: number;
};
export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const current = images[active];
  return (
    <section aria-label="Mahsulot rasmlari" className="grid gap-3">
      <div className="bg-muted grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl border">
        {current ? (
          <Image
            alt={current.alt}
            className="h-full w-full object-contain"
            height={current.height}
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            src={current.url}
            width={current.width}
          />
        ) : (
          <Bike
            aria-label="Rasm mavjud emas"
            className="text-muted-foreground size-20"
          />
        )}
      </div>
      {images.length > 1 ? (
        <div
          aria-label="Rasm tanlash"
          className="grid grid-cols-5 gap-2"
          role="list"
        >
          {images.map((image, index) => (
            <button
              aria-label={`${index + 1}-rasmni ko‘rsatish`}
              aria-pressed={index === active}
              className="aria-pressed:ring-primary bg-muted aspect-square overflow-hidden rounded-lg border aria-pressed:ring-2"
              key={image.id}
              onClick={() => setActive(index)}
              type="button"
            >
              <Image
                alt=""
                className="h-full w-full object-cover"
                height={image.height}
                sizes="120px"
                src={image.url}
                width={image.width}
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
