"use client";

import { Settings2, UserRound, Utensils } from "lucide-react";
import Link from "next/link";

import { useI18n } from "@/lib/i18n";

export function AppHeader() {
  const { t, locale, setLocale } = useI18n();
  return (
    <header className="relative z-40 border-b border-black/8 bg-rice-50/85 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between sm:h-[72px]">
        <Link href="/" className="flex min-h-11 min-w-0 items-center gap-1.5 rounded-xl sm:gap-2.5 sm:pr-2" aria-label={t("homeAria")}>
          <span className="grid size-9 shrink-0 rotate-[-4deg] place-items-center rounded-[12px] bg-tomato-500 text-white shadow-[0_3px_0_#a52e22]">
            <Utensils size={19} strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className={`display-type truncate font-black sm:text-[22px] ${locale === "en" ? "text-[16px] tracking-[-0.02em]" : "text-[20px]"}`}>{t("appName")}</span>
        </Link>
        <nav aria-label={t("navAria")} className="flex shrink-0 items-center sm:gap-1">
          {/* Icon only on phones, so the app name has room next to the language button. */}
          <Link href="/taste" className="quiet-button px-2 text-sm sm:px-3" aria-label={t("navTaste")}>
            <UserRound size={19} className="sm:hidden" aria-hidden="true" />
            <span className="hidden sm:inline">{t("navTaste")}</span>
          </Link>
          <button
            type="button"
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            className="quiet-button px-2 text-sm sm:px-3"
            lang={locale === "zh" ? "en" : "zh-CN"}
            aria-label={t("switchLanguage")}
          >
            {t("languageButton")}
          </button>
          <Link href="/privacy" className="grid size-10 place-items-center rounded-full text-ink-700 hover:bg-black/5 sm:size-11" aria-label={t("navSettings")}>
            <Settings2 size={19} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
