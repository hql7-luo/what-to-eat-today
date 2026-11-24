"use client";

import Link from "next/link";

import { useI18n } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="page-container grid min-h-[70svh] place-items-center py-16 text-center">
      <div><p className="numeric-type text-7xl font-black text-yolk-400">404</p><h1 className="display-type mt-3 text-4xl font-black">{t("notFoundTitle")}</h1><p className="mt-3 text-ink-500">{t("notFoundBody")}</p><Link href="/" className="primary-button mt-7">{t("notFoundAction")}</Link></div>
    </div>
  );
}
