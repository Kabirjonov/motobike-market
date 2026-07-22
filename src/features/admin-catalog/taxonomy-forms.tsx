"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { saveBrandAction, saveCategoryAction } from "./actions";
import { Field, TextareaField } from "./form-controls";

type CategoryValue = {
  id?: string;
  isActive?: boolean;
  sortOrder?: number;
  translations?: {
    description?: string | null;
    locale: string;
    name: string;
    seoDescription?: string | null;
    seoTitle?: string | null;
    slug: string;
  }[];
};
export function CategoryForm({ value = {} }: { value?: CategoryValue }) {
  const [state, action, pending] = useActionState(saveCategoryAction, {
    message: "",
  });
  return (
    <form action={action} className="grid gap-4">
      {value.id ? <input name="id" type="hidden" value={value.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          defaultValue={value.sortOrder ?? 0}
          label="Tartib"
          min={0}
          name="sortOrder"
          required
          type="number"
        />
        <label className="flex items-center gap-2 self-end rounded-lg border p-3 text-sm font-semibold">
          <input
            defaultChecked={value.isActive ?? true}
            name="isActive"
            type="checkbox"
          />{" "}
          Faol
        </label>
      </div>
      {(["UZ", "RU", "EN"] as const).map((locale) => {
        const item = value.translations?.find((row) => row.locale === locale);
        return (
          <fieldset className="grid gap-3 rounded-xl border p-3" key={locale}>
            <legend className="px-1 font-bold">{locale}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                defaultValue={item?.name}
                label="Nom"
                name={`${locale}.name`}
                required
              />
              <Field
                defaultValue={item?.slug}
                label="Slug"
                name={`${locale}.slug`}
                required
              />
            </div>
            <TextareaField
              defaultValue={item?.description ?? ""}
              label="Tavsif"
              name={`${locale}.description`}
              required
              rows={2}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                defaultValue={item?.seoTitle ?? ""}
                label="Meta title"
                name={`${locale}.seoTitle`}
              />
              <Field
                defaultValue={item?.seoDescription ?? ""}
                label="Meta description"
                name={`${locale}.seoDescription`}
              />
            </div>
          </fieldset>
        );
      })}
      {state.message ? (
        <p className="text-destructive text-sm font-semibold" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button disabled={pending} type="submit">
        {pending ? "Saqlanmoqda…" : "Saqlash"}
      </Button>
    </form>
  );
}

type BrandValue = {
  id?: string;
  isActive?: boolean;
  name?: string;
  slug?: string;
  websiteUrl?: string | null;
};
export function BrandForm({ value = {} }: { value?: BrandValue }) {
  const [state, action, pending] = useActionState(saveBrandAction, {
    message: "",
  });
  return (
    <form action={action} className="grid gap-3">
      {value.id ? <input name="id" type="hidden" value={value.id} /> : null}
      <Field
        defaultValue={value.name}
        label="Brend nomi"
        name="name"
        required
      />
      <Field defaultValue={value.slug} label="Slug" name="slug" required />
      <Field
        defaultValue={value.websiteUrl ?? ""}
        label="Veb-sayt"
        name="websiteUrl"
        type="url"
      />
      <label className="flex items-center gap-2 rounded-lg border p-3 text-sm font-semibold">
        <input
          defaultChecked={value.isActive ?? true}
          name="isActive"
          type="checkbox"
        />{" "}
        Faol
      </label>
      {state.message ? (
        <p className="text-destructive text-sm font-semibold" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button disabled={pending} type="submit">
        {pending ? "Saqlanmoqda…" : "Saqlash"}
      </Button>
    </form>
  );
}
