"use client";

import { LoaderCircle } from "lucide-react";

import { useI18n } from "@/lib/i18n";

export function PageLoading({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="page-container grid min-h-[65svh] place-items-center py-16" role="status" aria-live="polite">
      <div className="text-center"><LoaderCircle className="mx-auto animate-spin text-tomato-500" aria-hidden="true" /><p className="mt-3 text-sm font-bold text-ink-500">{label ?? t("loadingRestore")}</p></div>
    </div>
  );
}
