"use client";

import { useSyncExternalStore } from "react";

export type AdminLocale = "uz" | "ru" | "en";

const LOCALE_KEY = "locale";
const LOCALE_EVENT = "motobike:locale-change";

function parseLocale(value: string | null): AdminLocale {
  return value === "ru" || value === "en" ? value : "uz";
}

function getSnapshot(): AdminLocale {
  return parseLocale(window.localStorage.getItem(LOCALE_KEY));
}

function getServerSnapshot(): AdminLocale {
  return "uz";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCALE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCALE_EVENT, callback);
  };
}

export function useAdminLocale(): AdminLocale {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setAdminLocale(locale: AdminLocale) {
  window.localStorage.setItem(LOCALE_KEY, locale);
  window.dispatchEvent(new Event(LOCALE_EVENT));
}
