import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlClass =
  "border-input bg-background focus-visible:ring-ring min-h-10 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-60";

export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      <span>{label}</span>
      <input className={controlClass} {...props} />
    </label>
  );
}

export function SelectField({
  children,
  label,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      <span>{label}</span>
      <select className={controlClass} {...props}>
        {children}
      </select>
    </label>
  );
}

export function TextareaField({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      <span>{label}</span>
      <textarea className={controlClass} {...props} />
    </label>
  );
}
