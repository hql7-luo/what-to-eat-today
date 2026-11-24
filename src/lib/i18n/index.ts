"use client";

import { useCallback } from "react";

import { categoryName, dishName } from "@/lib/i18n/dishes";
import { setLocale, useLocale, type Locale } from "@/lib/i18n/locale";
import { format, messages, type MessageKey } from "@/lib/i18n/messages";
import { formatReason } from "@/lib/i18n/reasons";

export type { Locale } from "@/lib/i18n/locale";
export { budgetLabel, spiceLevelLabels, spicePreferenceLabels } from "@/lib/i18n/messages";

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  return format(messages[locale][key], vars);
}

/** Text helpers for the current language. */
export function useI18n() {
  const locale = useLocale();
  const t = useCallback((key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars), [locale]);
  return {
    locale,
    t,
    setLocale,
    dish: useCallback((name: string) => dishName(name, locale), [locale]),
    category: useCallback((name: string) => categoryName(name, locale), [locale]),
    reason: useCallback((code: string) => formatReason(code, locale), [locale]),
  };
}
