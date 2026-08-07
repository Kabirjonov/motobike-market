"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    image: "/home/hero-superbike.png",
    title: "Yo‘l seniki.",
    description:
      "Mototsikllar va aksessuarlar uchun eng ishonchli marketplace. Tez yetkazib berish. Kafolat. Sifat.",
  },
  {
    image: "/home/hero-adventure.png",
    title: "Sarguzashtni boshlang.",
    description:
      "Shahar tashqarisidagi yangi yo‘llarni kashf eting. Ishonchli texnika va safar uchun kerakli jihozlar bir joyda.",
  },
  {
    image: "/home/hero-urban.png",
    title: "Shahar ritmi seniki.",
    description:
      "Har kunlik yo‘l uchun chaqqon mototsikllar, sifatli ehtiyot qismlar va zamonaviy himoya jihozlari.",
  },
] as const;

const benefits = [
  [Truck, "Tez yetkazib berish", "O‘zbekiston bo‘ylab"],
  [ShieldCheck, "Kafolat va servis", "Ishonchli himoya"],
  [RefreshCcw, "Oson qaytarish", "14 kun ichida"],
] as const;

export function HomeHeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      aria-label="Asosiy takliflar"
      aria-roledescription="carousel"
      className="home-hero relative overflow-hidden text-white"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setPaused(false);
      }}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div aria-live="off" className="absolute inset-0">
        {slides.map((slide, index) => (
          <motion.div
            animate={{
              opacity: index === active ? 1 : 0,
              scale: index === active && !reducedMotion ? 1.035 : 1,
            }}
            aria-hidden={index !== active}
            className="home-hero-slide"
            initial={false}
            key={slide.image}
            style={{ backgroundImage: `url(${slide.image})` }}
            transition={{
              opacity: { duration: reducedMotion ? 0 : 0.9 },
              scale: {
                duration: reducedMotion ? 0 : 5.6,
                ease: "linear",
              },
            }}
          />
        ))}
      </div>
      <div className="relative z-10 container flex min-h-[430px] items-center py-12 md:min-h-[520px]">
        <div className="max-w-[520px] pt-4">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-[3px] w-12 bg-red-600" />
            <span className="h-px w-6 bg-white/40" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reducedMotion ? 0 : -24 }}
              initial={{ opacity: 0, x: reducedMotion ? 0 : 32 }}
              key={slides[active].title}
              transition={{ duration: reducedMotion ? 0 : 0.45 }}
            >
              <h1 className="text-5xl leading-[0.95] font-black tracking-[-0.055em] sm:text-7xl">
                {slides[active].title}
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-white/65">
                {slides[active].description}
              </p>
            </motion.div>
          </AnimatePresence>
          <motion.div
            className="inline-block"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              className="mt-7 inline-flex h-12 items-center gap-3 rounded-md bg-red-600 px-6 text-sm font-bold transition hover:bg-red-500"
              href="/catalog"
            >
              Katalogni ko‘rish <ArrowRight className="size-4" />
            </Link>
          </motion.div>
          <div className="mt-8 grid max-w-xl grid-cols-1 gap-5 text-sm sm:grid-cols-3">
            {benefits.map(([Icon, title, text], index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
                key={title}
                transition={{
                  delay: reducedMotion ? 0 : 0.28 + index * 0.08,
                  duration: reducedMotion ? 0 : 0.45,
                }}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25">
                  <Icon className="size-5" />
                </span>
                <span>
                  <strong className="block text-xs">{title}</strong>
                  <small className="text-white/50">{text}</small>
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute right-0 bottom-8 left-0 z-20">
        <div className="container flex justify-center gap-2 lg:justify-end">
          {slides.map((slide, index) => (
            <button
              aria-label={`${index + 1}-slayd: ${slide.title}`}
              aria-pressed={active === index}
              className={`h-1.5 rounded-full transition-all ${
                active === index
                  ? "w-9 bg-red-600"
                  : "w-3 bg-white/45 hover:bg-white"
              }`}
              key={slide.title}
              onClick={() => setActive(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
