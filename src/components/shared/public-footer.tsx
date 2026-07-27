"use client";

import { Bike, Mail, MapPin, Phone, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";

const groups = [
  [
    "Katalog",
    "Mototsikllar",
    "Ehtiyot qismlar",
    "Aksessuarlar",
    "Himoya jihozlari",
  ],
  [
    "Ma’lumot",
    "Biz haqimizda",
    "Yetkazib berish",
    "To‘lov usullari",
    "Qaytarish va almashish",
  ],
  [
    "Yordam",
    "Ko‘p so‘raladigan savollar",
    "Qo‘llab-quvvatlash",
    "Hukm va shartlar",
    "Maxfiylik siyosati",
  ],
];

export function PublicFooter() {
  return (
    <footer className="bg-[#111416] text-white">
      <div className="container grid gap-8 py-9 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_1fr_1.15fr_1.2fr]">
        <Reveal direction="right">
          <div>
            <Image
              alt="Moto Market"
              className="h-auto w-40"
              height={44}
              src="/moto-market-logo-horizontal.png"
              width={210}
            />
            <p className="mt-3 max-w-[210px] text-xs leading-5 text-white/55">
              Mototsikllar va moto jihozlar uchun yetakchi onlayn marketplace.
            </p>
            <Bike className="mt-5 size-5 text-white/70" />
          </div>
        </Reveal>
        {groups.map(([title, ...links], index) => (
          <Reveal delay={index * 0.06} key={title}>
            <div className="border-white/15 lg:border-l lg:pl-8">
              <h2 className="text-xs font-bold">{title}</h2>
              <ul className="mt-3 grid gap-2 text-[11px] text-white/55">
                {links.map((label) => (
                  <li className="transition hover:translate-x-1" key={label}>
                    <Link className="hover:text-white" href="/catalog">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
        <Reveal delay={0.18}>
          <div className="border-white/15 lg:border-l lg:pl-8">
            <h2 className="text-xs font-bold">Kontaktlar</h2>
            <div className="mt-3 grid gap-2 text-[11px] text-white/65">
              <p className="flex gap-2">
                <Phone className="size-3.5" /> +998 78 113 22 33
              </p>
              <p className="flex gap-2">
                <Mail className="size-3.5" /> info@motomarket.uz
              </p>
              <p className="flex gap-2">
                <MapPin className="size-3.5" /> Toshkent, Chilonzor tumani
              </p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.24} direction="left">
          <div className="border-white/15 lg:border-l lg:pl-8">
            <h2 className="text-xs font-bold">Yangiliklar va aksiyalar</h2>
            <p className="mt-3 text-[11px] leading-4 text-white/55">
              Eng so‘nggi yangiliklar va chegirmalarni birinchilardan bo‘lib
              oling.
            </p>
            <div className="mt-4 flex h-9 overflow-hidden rounded border border-white/20">
              <input
                className="min-w-0 flex-1 bg-transparent px-3 text-[11px] outline-none"
                placeholder="Email manzilingiz"
              />
              <button
                aria-label="Obuna bo‘lish"
                className="grid w-11 place-items-center bg-red-600 transition hover:w-14"
                type="button"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
