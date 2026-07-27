"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const reducedMotion = useReducedMotion();
  return (
    <section aria-label="Mahsulot rasmlari" className="grid gap-3">
      <div className="bg-muted grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl border">
        {current ? (
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="h-full w-full"
              exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.97 }}
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 1.03 }}
              key={current.id}
              transition={{ duration: reducedMotion ? 0 : 0.32 }}
            >
              <Image
                alt={current.alt}
                className="h-full w-full object-contain"
                height={current.height}
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                src={current.url}
                width={current.width}
              />
            </motion.div>
          </AnimatePresence>
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
            <motion.button
              aria-label={`${index + 1}-rasmni ko‘rsatish`}
              aria-pressed={index === active}
              className="aria-pressed:ring-primary bg-muted aspect-square overflow-hidden rounded-lg border aria-pressed:ring-2"
              key={image.id}
              onClick={() => setActive(index)}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                alt=""
                className="h-full w-full object-cover"
                height={image.height}
                sizes="120px"
                src={image.url}
                width={image.width}
              />
            </motion.button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
