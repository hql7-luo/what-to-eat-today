"use client";

import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";

import { useI18n } from "@/lib/i18n";

export function EmptyState({
  title,
  description,
  href = "/choose/preferences",
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="ticket-card mx-auto max-w-lg p-8 text-center sm:p-12">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-yolk-400/25 text-ink-900">
        <UtensilsCrossed aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-black">{title}</h1>
      <p className="mt-2 leading-7 text-ink-500">{description}</p>
      <Link href={href} className="primary-button mt-6">{action ?? t("changePreferences")}</Link>
    </div>
  );
}
