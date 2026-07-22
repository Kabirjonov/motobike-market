"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { transitionOrderAction } from "@/features/admin-orders/actions";

export function TransitionForm({
  orderId,
  transitions,
}: {
  orderId: string;
  transitions: readonly string[];
}) {
  const [state, action, pending] = useActionState(transitionOrderAction, {
    message: "",
  });
  if (!transitions.length)
    return (
      <p className="text-muted-foreground text-sm">
        Bu buyurtma terminal statusda.
      </p>
    );
  return (
    <form action={action} className="grid gap-3">
      <input name="orderId" type="hidden" value={orderId} />
      <label className="grid gap-1 text-sm font-semibold">
        Yangi status
        <select
          className="border-input rounded-lg border px-3 py-2"
          name="toStatus"
          required
        >
          {transitions.map((status) => (
            <option key={status} value={status}>
              {status === "COMPLETED" ? "DELIVERED" : status}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Audit izohi
        <textarea
          className="border-input min-h-24 rounded-lg border px-3 py-2"
          maxLength={500}
          minLength={3}
          name="note"
          required
        />
      </label>
      {state.message ? (
        <p
          className={
            state.success
              ? "text-sm text-emerald-700"
              : "text-destructive text-sm"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <Button disabled={pending} type="submit">
        {pending ? "Saqlanmoqda…" : "Statusni yangilash"}
      </Button>
    </form>
  );
}
