"use client";

import { useSyncExternalStore } from "react";

export type Locale = "zh" | "en";

// The app is served under hql7-luo.github.io, so it shares the portfolio site's language choice.
export const LANGUAGE_KEY = "portfolio-language";
const SERVER_LOCALE: Locale = "zh";

let current: Locale | null = null;
const listeners = new Set<() => void>();

function readStored(): string | null {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

export function detectLocale(): Locale {
  if (typeof window === "undefined") return SERVER_LOCALE;
  const param = new URLSearchParams(window.location.search).get("lang");
  if (param === "zh" || param === "en") {
    // Remember it, so later full page loads without ?lang keep the same language.
    try {
      window.localStorage.setItem(LANGUAGE_KEY, param);
    } catch {
      // Storage can be blocked; the choice still applies to this page.
    }
    return param;
  }
  const stored = readStored();
  if (stored === "zh" || stored === "en") return stored;
  return (window.navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function getLocale(): Locale {
  if (current === null) current = detectLocale();
  return current;
}

export function setLocale(next: Locale): void {
  current = next;
  try {
    window.localStorage.setItem(LANGUAGE_KEY, next);
  } catch {
    // Storage can be blocked; the choice still applies to this page.
  }
  const url = new URL(window.location.href);
  if (url.searchParams.has("lang")) {
    url.searchParams.set("lang", next);
    window.history.replaceState(window.history.state, "", url);
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Server and first hydration render use Chinese; the client then switches if needed. */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getLocale, () => SERVER_LOCALE);
}
