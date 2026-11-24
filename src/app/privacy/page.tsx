"use client";

import { Database, MapPinOff, Search, ShieldCheck, Store, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

import { PageLoading } from "@/components/page-loading";
import { useAppStore } from "@/features/store/use-app-store";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const soundEnabled = useAppStore((state) => state.soundEnabled);
  const toggleSound = useAppStore((state) => state.toggleSound);
  const { t } = useI18n();

  if (!hasHydrated) return <PageLoading />;

  return (
    <div className="page-container py-8 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <p className="numeric-type text-xs font-black uppercase tracking-[0.2em] text-tomato-600">Settings & privacy</p>
        <h1 className="display-type mt-2 text-4xl font-black sm:text-5xl">{t("privTitle")}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink-500">{t("privIntro")}</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black text-tomato-600">{t("privSound")}</p><h2 className="mt-1 text-xl font-black">{t("privSoundTitle")}</h2></div><span className="grid size-11 place-items-center rounded-2xl bg-yolk-400/25">{soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}</span></div>
            <p className="mt-3 text-sm leading-6 text-ink-500">{t("privSoundBody")}</p>
            <button type="button" onClick={toggleSound} aria-pressed={soundEnabled} className={`mt-5 w-full ${soundEnabled ? "secondary-button" : "primary-button"}`}>{soundEnabled ? t("privSoundOff") : t("privSoundOn")}</button>
          </section>

          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black text-tomato-600">{t("privData")}</p><h2 className="mt-1 text-xl font-black">{t("privDataTitle")}</h2></div><Database className="text-cucumber-500" aria-hidden="true" /></div>
            <p className="mt-4 text-sm leading-6 text-ink-500">{t("privDataBody")}</p>
          </section>
        </div>

        <section className="ticket-card mt-5 overflow-hidden">
          <div className="border-b border-black/8 p-6 sm:p-7"><h2 className="text-2xl font-black">{t("privBoundary")}</h2><p className="mt-2 text-sm leading-6 text-ink-500">{t("privBoundaryBody")}</p></div>
          <div className="divide-y divide-black/8">
            {[
              [MapPinOff, t("privNoLocation"), t("privNoLocationBody")],
              [ShieldCheck, t("privLocal"), t("privLocalBody")],
              [Store, t("privShops"), t("privShopsBody")],
              [Search, t("privNoPlatform"), t("privNoPlatformBody")],
            ].map(([Icon, title, description]) => (
              <div key={String(title)} className="flex gap-4 p-6 sm:p-7"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-black/5"><Icon size={20} aria-hidden="true" /></span><div><h3 className="font-black">{String(title)}</h3><p className="mt-1 text-sm leading-6 text-ink-500">{String(description)}</p></div></div>
            ))}
          </div>
        </section>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/taste" className="primary-button">{t("privViewTaste")}</Link>
          <Link href="/choose/preferences" className="secondary-button">{t("tasteStart")}</Link>
        </div>
      </div>
    </div>
  );
}
