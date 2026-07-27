"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  type LoginActionState,
  loginAdmin,
} from "@/features/admin-auth/actions";

const initialState: LoginActionState = {};

export function AdminLoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState(loginAdmin, initialState);
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <form action={action} className="mt-8 space-y-5">
      <input name="redirectTo" type="hidden" value={redirectTo} />
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="username"
          autoFocus
          className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 outline-none focus-visible:ring-2"
          id="email"
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="password">
          Parol
        </label>
        <div className="relative">
          <input
            autoComplete="current-password"
            className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border pr-11 pl-3 outline-none focus-visible:ring-2"
            id="password"
            maxLength={256}
            name="password"
            required
            type={passwordVisible ? "text" : "password"}
          />
          <button
            aria-label={
              passwordVisible ? "Parolni yashirish" : "Parolni ko‘rsatish"
            }
            aria-pressed={passwordVisible}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-md transition outline-none hover:scale-105 focus-visible:ring-2"
            onClick={() => setPasswordVisible((visible) => !visible)}
            type="button"
          >
            {passwordVisible ? (
              <EyeOff aria-hidden="true" className="size-5" />
            ) : (
              <Eye aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>
      {state.message ? (
        <p aria-live="polite" className="text-destructive text-sm" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Tekshirilmoqda…" : "Admin panelga kirish"}
      </Button>
    </form>
  );
}
