"use client";

import { ArrowRight, LoaderCircle, RefreshCw, SlidersHorizontal, Utensils } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { CandidateCard } from "@/components/candidate-card";
import { EmptyState } from "@/components/empty-state";
import { FlowHeading } from "@/components/flow-heading";
import { PageLoading } from "@/components/page-loading";
import { dishes } from "@/data/dishes";
import { useAppStore } from "@/features/store/use-app-store";
import { useI18n } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/messages";
import { recommendDishes } from "@/lib/recommendation";
import type { RelaxedConstraint } from "@/types";

// Notices are kept as message keys so they follow a language switch.
type NoticePart = { key: MessageKey } | { relaxed: RelaxedConstraint[] };

const relaxedLabelKeys = { budget: "candRelaxedBudget", wait: "candRelaxedWait", goal: "candRelaxedGoal" } as const;

function relaxedNotice(candidates: ReturnType<typeof recommendDishes>): NoticePart {
  const relaxed = new Set(candidates.flatMap((candidate) => candidate.relaxedConstraints));
  const list = (["budget", "wait", "goal"] as const).filter((item) => relaxed.has(item));
  return list.length > 0 ? { relaxed: list } : { key: "candReady" };
}

export default function CandidatesPage() {
  const router = useRouter();
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const preferences = useAppStore((state) => state.preferences);
  const candidates = useAppStore((state) => state.candidates);
  const history = useAppStore((state) => state.history);
  const tasteProfile = useAppStore((state) => state.tasteProfile);
  const sessionExcludedDishIds = useAppStore((state) => state.sessionExcludedDishIds);
  const sessionDislikedDishIds = useAppStore((state) => state.sessionDislikedDishIds);
  const setCandidates = useAppStore((state) => state.setCandidates);
  const [loading, setLoading] = useState(candidates.length === 0);
  const [notice, setNotice] = useState<NoticePart[]>([]);
  const { t } = useI18n();
  const noticeText = notice
    .map((part) => ("key" in part ? t(part.key) : t("candRelaxedNotice", { list: part.relaxed.map((item) => t(relaxedLabelKeys[item])).join(t("candListSeparator")) })))
    .join(" ");

  const generate = useCallback((additionalExcludedDishIds: string[] = []) => {
    const nextCandidates = recommendDishes({
      dishes,
      preferences,
      history,
      tasteProfile,
      excludedDishIds: [...sessionExcludedDishIds, ...additionalExcludedDishIds],
      dislikedDishIds: sessionDislikedDishIds,
      limit: 10,
    });
    setCandidates(nextCandidates);
    return nextCandidates;
  }, [history, preferences, sessionDislikedDishIds, sessionExcludedDishIds, setCandidates, tasteProfile]);

  useEffect(() => {
    if (!hasHydrated) return;
    const timer = window.setTimeout(() => {
      setLoading(true);
      const generated = generate();
      setNotice([relaxedNotice(generated)]);
      window.setTimeout(() => setLoading(false), 180);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [generate, hasHydrated]);

  const refresh = () => {
    setLoading(true);
    const next = generate(candidates.map((candidate) => candidate.dishId));
    if (next.length < 6) {
      const fallback = generate();
      setNotice([{ key: "candNotEnough" }, relaxedNotice(fallback)]);
    } else {
      setNotice([{ key: "candRefreshed" }, relaxedNotice(next)]);
    }
    window.setTimeout(() => setLoading(false), 180);
  };

  if (!hasHydrated) return <PageLoading />;

  return (
    <div className="page-container py-8 sm:py-14">
      <FlowHeading eyebrow={t("candEyebrow")} title={t("candTitle")} description={t("candDescription")} backHref="/choose/preferences" />
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-black/10 bg-white/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-ink-700"><Utensils size={17} className="text-tomato-500" aria-hidden="true" />{t("candAnywhere")}</span>
        <Link href="/choose/preferences" className="quiet-button px-3 text-sm"><SlidersHorizontal size={16} aria-hidden="true" />{t("candEdit")}</Link>
      </div>

      <p aria-live="polite" className="mb-5 min-h-6 text-sm font-medium text-ink-500">{noticeText}</p>

      {loading ? (
        <div className="grid min-h-80 place-items-center rounded-[28px] border border-dashed border-black/15 bg-white/35">
          <div className="text-center"><LoaderCircle className="mx-auto animate-spin text-tomato-500" aria-hidden="true" /><p className="mt-3 font-bold">{t("candLoading")}</p><p className="mt-1 text-sm text-ink-500">{t("candLoadingNote")}</p></div>
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState title={t("candEmptyTitle")} description={t("candEmptyDescription")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {candidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} />)}
        </div>
      )}

      {candidates.length > 0 ? (
        <div className="bottom-safe sticky bottom-0 z-30 mt-8 flex flex-col-reverse gap-3 border-t border-black/10 bg-[linear-gradient(180deg,transparent_0%,#f8f1e4_24%)] pt-8 sm:flex-row sm:justify-end">
          <button type="button" onClick={refresh} disabled={loading} className="secondary-button px-6"><RefreshCw size={18} aria-hidden="true" />{t("candRefresh")}</button>
          <button type="button" onClick={() => router.push("/roulette")} className="primary-button px-7">{t("candGo")} <ArrowRight size={18} aria-hidden="true" /></button>
        </div>
      ) : null}
    </div>
  );
}
