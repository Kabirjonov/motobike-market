import { ProductType } from "@/generated/prisma/enums";

import { Field, TextareaField } from "./form-controls";

type Props = {
  compatibility?: string;
  motorcycle?: {
    engineCc: number;
    make: string;
    mileageKm: number;
    model: string;
    year: number;
  } | null;
  part?: { partNumber: string } | null;
  type: ProductType;
};

export function ProductSpecFields({
  compatibility,
  motorcycle,
  part,
  type,
}: Props) {
  if (type === ProductType.MOTORCYCLE)
    return (
      <section className="grid gap-4">
        <h2 className="text-lg font-bold">Mototsikl xususiyatlari</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field
            defaultValue={motorcycle?.make}
            label="Ishlab chiqaruvchi"
            name="motorcycle.make"
            required
          />
          <Field
            defaultValue={motorcycle?.model}
            label="Model"
            name="motorcycle.model"
            required
          />
          <Field
            defaultValue={motorcycle?.year}
            label="Yil"
            min={1900}
            name="motorcycle.year"
            required
            type="number"
          />
          <Field
            defaultValue={motorcycle?.engineCc}
            label="Dvigatel, cc"
            min={1}
            name="motorcycle.engineCc"
            required
            type="number"
          />
          <Field
            defaultValue={motorcycle?.mileageKm ?? 0}
            label="Yurgan, km"
            min={0}
            name="motorcycle.mileageKm"
            required
            type="number"
          />
        </div>
      </section>
    );
  if (type === ProductType.PART)
    return (
      <section className="grid gap-4">
        <div>
          <h2 className="text-lg font-bold">Qism va moslik</h2>
          <p className="text-muted-foreground text-sm">
            Har satr: Marka | Model | Yildan | Yilgacha | cc | Izoh
          </p>
        </div>
        <Field
          defaultValue={part?.partNumber}
          label="Part number"
          name="part.partNumber"
          required
        />
        <TextareaField
          defaultValue={compatibility}
          label="Compatibility"
          name="compatibilities"
          placeholder="Honda | CB500X | 2019 | 2024 | 500 | Old tormoz"
          rows={5}
        />
      </section>
    );
  return (
    <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
      Bu mahsulot turiga qo‘shimcha texnik maydon kerak emas.
    </p>
  );
}
