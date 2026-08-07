"use client";

import { useState } from "react";

type InteractiveTabsSectionProps = {
  specRows: [string, string][];
  description: string;
};

export function InteractiveTabsSection({ specRows, description }: InteractiveTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "desc" | "delivery">("specs");

  return (
    <section className="rounded-md border border-zinc-200 bg-white shadow-sm overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-200 bg-white text-sm font-semibold">
        <button
          onClick={() => setActiveTab("specs")}
          className={`px-6 py-4 border-b-2 font-extrabold transition-all relative ${
            activeTab === "specs"
              ? "border-[#e31e24] text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-600 animate-none"
          }`}
          type="button"
        >
          Texnik xususiyatlar
        </button>
        <button
          onClick={() => setActiveTab("desc")}
          className={`px-6 py-4 border-b-2 font-extrabold transition-all relative ${
            activeTab === "desc"
              ? "border-[#e31e24] text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-600 animate-none"
          }`}
          type="button"
        >
          Tavsif
        </button>
        <button
          onClick={() => setActiveTab("delivery")}
          className={`px-6 py-4 border-b-2 font-extrabold transition-all relative ${
            activeTab === "delivery"
              ? "border-[#e31e24] text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-600 animate-none"
          }`}
          type="button"
        >
          Yetkazib berish
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {activeTab === "specs" && (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Specs Table */}
            <div>
              <dl className="text-sm divide-y divide-zinc-100">
                {specRows.map(([label, value]) => (
                  <div className="grid grid-cols-2 py-3" key={label}>
                    <dt className="text-zinc-500 font-medium">{label}</dt>
                    <dd className="font-semibold text-zinc-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Side description */}
            <div className="border-t pt-6 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-8 border-zinc-100">
              <h3 className="text-base font-extrabold text-zinc-950 mb-3">Tavsif</h3>
              <div className="text-sm leading-relaxed text-zinc-600 whitespace-pre-line">
                {description}
              </div>
            </div>
          </div>
        )}

        {activeTab === "desc" && (
          <article className="max-w-none">
            <h3 className="text-base font-extrabold text-zinc-950 mb-3">Tavsif</h3>
            <div className="text-sm leading-relaxed text-zinc-600 whitespace-pre-line">
              {description}
            </div>
          </article>
        )}

        {activeTab === "delivery" && (
          <div className="text-sm text-zinc-600 leading-relaxed max-w-xl">
            <h3 className="text-base font-extrabold text-zinc-950 mb-3">Yetkazib berish shartlari</h3>
            <p className="mb-3">
              Do‘konimiz orqali amalga oshirilgan barcha buyurtmalar sifatli qadoqlanadi va kelishilgan vaqtda yetkazib beriladi:
            </p>
            <ul className="list-disc pl-5 grid gap-2">
              <li><strong>Toshkent shahrida:</strong> 1-2 ish kuni ichida (bepul yoki standart tarif bo‘yicha).</li>
              <li><strong>Viloyatlar bo‘ylab:</strong> 2-5 ish kuni ichida kuryerlik xizmatlari orqali.</li>
              <li><strong>Do‘kondan olib ketish:</strong> Buyurtmani tasdiqlaganimizdan so‘ng shaxsan kelib olib ketishingiz mumkin.</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
