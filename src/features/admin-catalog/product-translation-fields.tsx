import { Field, TextareaField } from "./form-controls";

export type TranslationValue = {
  description: string;
  locale: "UZ" | "RU" | "EN";
  name: string;
  seoDescription?: string | null;
  seoTitle?: string | null;
  slug: string;
};

export function ProductTranslationFields({
  translations,
}: {
  translations: TranslationValue[];
}) {
  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-lg font-bold">Tarjimalar</h2>
        <p className="text-muted-foreground text-sm">
          Barcha uch til katalog va SEO uchun saqlanadi.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {(["UZ", "RU", "EN"] as const).map((locale) => {
          const item = translations.find((value) => value.locale === locale);
          return (
            <fieldset
              className="border-border grid gap-3 rounded-xl border p-4"
              key={locale}
            >
              <legend className="px-1 text-sm font-black">{locale}</legend>
              <Field
                defaultValue={item?.name}
                label="Nomi"
                name={`${locale}.name`}
                required
              />
              <Field
                defaultValue={item?.slug}
                label="Slug"
                name={`${locale}.slug`}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                required
              />
              <TextareaField
                defaultValue={item?.description}
                label="Tavsif"
                name={`${locale}.description`}
                required
                rows={5}
              />
              <Field
                defaultValue={item?.seoTitle ?? ""}
                label="Meta title"
                name={`${locale}.seoTitle`}
              />
              <TextareaField
                defaultValue={item?.seoDescription ?? ""}
                label="Meta description"
                name={`${locale}.seoDescription`}
                rows={2}
              />
            </fieldset>
          );
        })}
      </div>
    </section>
  );
}
