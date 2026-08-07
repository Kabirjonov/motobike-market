"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ProductColor,
  ProductCondition,
  ProductStatus,
  ProductType,
} from "@/generated/prisma/enums";

import { saveProductAction } from "./actions";
import { Field, SelectField } from "./form-controls";
import { ProductSpecFields } from "./product-spec-fields";
import {
  ProductTranslationFields,
  type TranslationValue,
} from "./product-translation-fields";

export type ProductFormValue = {
  brandId?: string | null;
  categoryId?: string;
  compareAtPrice?: string | null;
  condition?: ProductCondition | null;
  color?: ProductColor | null;
  id?: string;
  isFeatured?: boolean;
  motorcycle?: {
    engineCc: number;
    make: string;
    mileageKm: number;
    model: string;
    year: number;
  } | null;
  part?: { partNumber: string } | null;
  price?: string;
  sku?: string;
  status?: ProductStatus;
  stock?: number;
  type?: ProductType;
  translations: TranslationValue[];
  compatibility?: string;
};

export function ProductForm({
  brands,
  categories,
  value,
}: {
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  value: ProductFormValue;
}) {
  const [type, setType] = useState(value.type ?? ProductType.MOTORCYCLE);
  const action = saveProductAction.bind(null, value.id);
  const [state, formAction, pending] = useActionState(action, { message: "" });
  return (
    <form action={formAction} className="grid gap-6">
      {state.message ? (
        <div
          aria-live="polite"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-3 text-sm font-semibold"
        >
          {state.message}
          {state.fieldErrors ? (
            <ul className="mt-2 list-disc pl-5">
              {Object.values(state.fieldErrors)
                .flat()
                .map((error) => (
                  <li key={error}>{error}</li>
                ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <section className="bg-card border-border grid gap-5 rounded-2xl border p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold">Asosiy ma’lumotlar</h2>
          <p className="text-muted-foreground text-sm">
            Narxlar UZS’da Decimal(12,2) formatida saqlanadi.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field defaultValue={value.sku} label="SKU" name="sku" required />
          <SelectField
            label="Mahsulot turi"
            name="type"
            onChange={(event) => setType(event.target.value as ProductType)}
            value={type}
          >
            {Object.values(ProductType).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
          <SelectField
            defaultValue={value.status ?? ProductStatus.DRAFT}
            label="Status"
            name="status"
          >
            {Object.values(ProductStatus).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
          <SelectField
            defaultValue={value.condition ?? ""}
            label="Holati"
            name="condition"
          >
            <option value="">Tanlanmagan</option>
            {Object.values(ProductCondition).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
          <SelectField defaultValue={value.color ?? ""} label="Rang" name="color">
            <option value="">Tanlanmagan</option>
            {Object.values(ProductColor).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
          <SelectField
            defaultValue={value.categoryId}
            label="Kategoriya"
            name="categoryId"
            required
          >
            <option value="">Tanlang</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            defaultValue={value.brandId ?? ""}
            label="Brend"
            name="brandId"
          >
            <option value="">Brendsiz</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </SelectField>
          <Field
            defaultValue={value.price}
            inputMode="decimal"
            label="Narx"
            name="price"
            placeholder="25000000.00"
            required
          />
          <Field
            defaultValue={value.compareAtPrice ?? ""}
            inputMode="decimal"
            label="Eski narx"
            name="compareAtPrice"
          />
          <Field
            defaultValue={value.stock ?? 0}
            label="Stock"
            min={0}
            name="stock"
            required
            type="number"
          />
          <label className="flex items-center gap-3 self-end rounded-lg border p-3 text-sm font-semibold">
            <input
              defaultChecked={value.isFeatured}
              name="isFeatured"
              type="checkbox"
            />{" "}
            Featured
          </label>
        </div>
      </section>
      <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
        <ProductSpecFields
          compatibility={value.compatibility}
          motorcycle={value.motorcycle}
          part={value.part}
          type={type}
        />
      </div>
      <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
        <ProductTranslationFields translations={value.translations} />
      </div>
      <div className="sticky bottom-4 flex justify-end">
        <Button disabled={pending} size="lg" type="submit">
          {pending ? "Saqlanmoqda…" : "Mahsulotni saqlash"}
        </Button>
      </div>
    </form>
  );
}
