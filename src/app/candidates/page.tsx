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
import { recommendDishes } from "@/lib/recommendation";

function relaxedNotice(candidates: ReturnType<typeof recommendDishes>): string {
  const relaxed = new Set(candidates.flatMap((candidate) => candidate.relaxedConstraints));
  const labels = [
    relaxed.has("budget") ? "预算" : null,
    relaxed.has("wait") ? "可接受时间" : null,
    relaxed.has("goal") ? "饮食目标" : null,
  ].filter(Boolean);
  return labels.length > 0 ? `候选较少，已适当放宽${labels.join("、")}。` : "已按你的条件生成菜品候选。";
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
  const [notice, setNotice] = useState("");

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
      setNotice(relaxedNotice(generated));
      window.setTimeout(() => setLoading(false), 180);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [generate, hasHydrated]);

  const refresh = () => {
    setLoading(true);
    const next = generate(candidates.map((candidate) => candidate.dishId));
    if (next.length < 6) {
      const fallback = generate();
      setNotice(["新候选不足，已保留部分高匹配结果并重新排序。", relaxedNotice(fallback)].join(" "));
    } else {
      setNotice(["已换一批候选，并尽量避开上一批结果。", relaxedNotice(next)].join(" "));
    }
    window.setTimeout(() => setLoading(false), 180);
  };

  if (!hasHydrated) return <PageLoading />;

  return (
    <div className="page-container py-8 sm:py-14">
      <FlowHeading eyebrow="候选池 · 约 10 份" title="先看看，今天的范围不差" description="候选来自本地 92 道菜品。最终结果由推荐权重决定，动画只负责揭晓。" backHref="/choose/preferences" />
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-black/10 bg-white/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-ink-700"><Utensils size={17} className="text-tomato-500" aria-hidden="true" />全国通用 · 不读取位置</span>
        <Link href="/choose/preferences" className="quiet-button px-3 text-sm"><SlidersHorizontal size={16} aria-hidden="true" />修改条件</Link>
      </div>

      <p aria-live="polite" className="mb-5 min-h-6 text-sm font-medium text-ink-500">{notice}</p>

      {loading ? (
        <div className="grid min-h-80 place-items-center rounded-[28px] border border-dashed border-black/15 bg-white/35">
          <div className="text-center"><LoaderCircle className="mx-auto animate-spin text-tomato-500" aria-hidden="true" /><p className="mt-3 font-bold">正在组合今天的菜品候选…</p><p className="mt-1 text-sm text-ink-500">会同时检查预算、辣度、人数和最近吃过</p></div>
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState title="这组条件暂时没有合适候选" description="可以稍微放宽预算、可接受时间或饮食目标，昨天吃过和本轮排除的菜仍不会回来。" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {candidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} />)}
        </div>
      )}

      {candidates.length > 0 ? (
        <div className="bottom-safe sticky bottom-0 z-30 mt-8 flex flex-col-reverse gap-3 border-t border-black/10 bg-[linear-gradient(180deg,transparent_0%,#f8f1e4_24%)] pt-8 sm:flex-row sm:justify-end">
          <button type="button" onClick={refresh} disabled={loading} className="secondary-button px-6"><RefreshCw size={18} aria-hidden="true" />换一批候选</button>
          <button type="button" onClick={() => router.push("/roulette")} className="primary-button px-7">进入开箱抽取 <ArrowRight size={18} aria-hidden="true" /></button>
        </div>
      ) : null}
    </div>
  );
}
