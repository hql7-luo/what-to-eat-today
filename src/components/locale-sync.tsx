"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useI18n } from "@/lib/i18n";

/** Keeps <html lang>, the tab title and the skip link in the visitor's language. */
export function LocaleSync() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
  }, [locale, pathname]);
  return (
    <>
    <title>{t("pageTitle")}</title>
    <a
      href="#main-content"
      className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-full bg-ink-900 px-4 py-2 text-sm font-bold text-white transition-transform focus:translate-y-0"
    >
      {t("skipToContent")}
    </a>
    </>
  );
}
