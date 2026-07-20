"use client";

import { ArrowRight, Check, Copy, Flame, Heart, RotateCcw, SlidersHorizontal, Store, ThumbsDown, Utensils } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DishImage } from "@/components/dish-image";
import { EmptyState } from "@/components/empty-state";
import { PageLoading } from "@/components/page-loading";
import { useAppStore } from "@/features/store/use-app-store";

const spiceLabels = ["不辣", "微辣", "中辣", "重辣"] as const;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }
}

export default function ResultPage() {
  const router = useRouter();
  const candidate = useAppStore((state) => state.selectedCandidate);
  const selectedResultId = useAppStore((state) => state.selectedResultId);
  const acceptedResultIds = useAppStore((state) => state.acceptedResultIds);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const favorites = useAppStore((state) => state.tasteProfile.favorites);
  const frequentShops = useAppStore((state) => state.frequentShops);
  const acceptCurrentResult = useAppStore((state) => state.acceptCurrentResult);
  const excludeCurrentResult = useAppStore((state) => state.excludeCurrentResult);
  const dislikeCurrentResult = useAppStore((state) => state.dislikeCurrentResult);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const [copied, setCopied] = useState(false);

  if (!hasHydrated) return <PageLoading />;

  if (!candidate) {
    return <div className="page-container py-16"><EmptyState title="还没有抽取结果" description="从候选池开始一次开箱抽取，结果会显示在这里。" href="/candidates" action="去候选池" /></div>;
  }

  const { dish } = candidate;
  const isFavorite = favorites.includes(candidate.dishId);
  const accepted = selectedResultId !== undefined && acceptedResultIds.includes(selectedResultId);
  const matchingShops = frequentShops.filter((shop) => shop.dishId === candidate.dishId);
  const dietTags = [
    dish.fatLossFriendly ? "减脂友好" : null,
    dish.muscleGainFriendly ? "增肌友好" : null,
  ].filter(Boolean);

  const drawAgain = () => {
    excludeCurrentResult();
    router.push("/roulette");
  };

  const dislike = () => {
    dislikeCurrentResult();
    router.push("/roulette");
  };

  const copyDishName = () => {
    void copyText(dish.name).then(setCopied);
  };

  return (
    <div className="page-container py-8 sm:py-14">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 22 }} className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><p className="numeric-type text-xs font-black uppercase tracking-[0.2em] text-tomato-600">Today&apos;s pick</p><h1 className="display-type mt-1 text-4xl font-black sm:text-5xl">食签揭晓</h1></div>
          <span className="rounded-full bg-cucumber-100 px-3 py-1.5 text-xs font-bold">本地菜品推荐</span>
        </div>

        <article className="group ticket-card overflow-hidden lg:grid lg:grid-cols-[1.08fr_0.92fr]">
          <DishImage dish={dish} priority className="lg:h-full lg:min-h-[520px]" />
          <div className="p-6 sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-bold text-tomato-600">今天就推荐这份</p><h2 className="display-type mt-1 text-4xl font-black leading-tight sm:text-5xl">{dish.name}</h2></div>
              <button type="button" onClick={() => toggleFavorite(candidate.dishId)} aria-pressed={isFavorite} className={`grid size-12 shrink-0 place-items-center rounded-full border transition-colors ${isFavorite ? "border-tomato-500 bg-tomato-500 text-white" : "border-black/12 bg-white/70 text-ink-700 hover:border-tomato-500"}`} aria-label={isFavorite ? "取消收藏" : "收藏菜品"}>
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
              </button>
            </div>

            <div className="numeric-type mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-ink-500">
              <span>常见 ¥{dish.priceRange[0]}–{dish.priceRange[1]}</span>
              <span className="inline-flex items-center gap-1"><Flame size={15} aria-hidden="true" />{spiceLabels[dish.spiceLevel]}</span>
              <span>{dish.category}</span>
            </div>
            {dietTags.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{dietTags.map((tag) => <span key={tag} className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-bold text-ink-700">{tag}</span>)}</div> : null}

            {matchingShops.length > 0 ? (
              <section className="mt-5 rounded-2xl border border-yolk-400/35 bg-yolk-400/16 p-4">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-ink-700"><Store size={16} aria-hidden="true" />你常点的店</p>
                <p className="mt-2 font-black">{matchingShops[0].name}</p>
                <p className="mt-1 text-sm text-ink-500">常点 {matchingShops[0].dishName} · 约 ¥{matchingShops[0].approximatePrice}</p>
                {matchingShops.length > 1 ? <p className="mt-1 text-xs font-bold text-ink-500">另有 {matchingShops.length - 1} 家匹配店铺，可在“我的口味”查看。</p> : null}
              </section>
            ) : null}

            <div className="mt-6 rounded-2xl border border-cucumber-500/20 bg-cucumber-100/65 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cucumber-500">为什么推荐</p>
              <ul className="mt-2 space-y-1.5 text-sm font-semibold leading-6 text-ink-700">
                {candidate.reasons.map((reason) => <li key={reason} className="flex gap-2"><Check size={16} className="mt-1 shrink-0 text-cucumber-500" aria-hidden="true" />{reason}</li>)}
              </ul>
            </div>
            <p className="mt-4 text-xs leading-5 text-ink-500">价格区间和通常准备时间来自本地菜品资料，仅用于帮助选择，不代表任何店铺或外卖平台的实时信息。</p>
          </div>
        </article>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button type="button" onClick={acceptCurrentResult} disabled={accepted} aria-pressed={accepted} className="primary-button py-4 text-base">
            {accepted ? <><Check size={19} aria-hidden="true" />已确认</> : <><Utensils size={19} aria-hidden="true" />就吃这个</>}
          </button>
          <button type="button" onClick={drawAgain} className="secondary-button py-4 text-base"><RotateCcw size={18} aria-hidden="true" />再抽一次</button>
          <button type="button" onClick={copyDishName} className="secondary-button py-4 text-base"><Copy size={18} aria-hidden="true" />复制菜名</button>
        </div>

        <p aria-live="polite" className="mt-3 min-h-5 text-center text-sm font-bold text-cucumber-500">{copied ? `已复制‘${dish.name}’，打开外卖平台搜索即可。` : ""}</p>

        {accepted ? (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} aria-live="polite" className="mt-3 rounded-[24px] border border-yolk-400/40 bg-yolk-400/18 p-5">
            <p className="font-black">选择已保存在本机</p><p className="mt-1 text-sm text-ink-500">刷新页面后仍会保持“已确认”，不会重复写入历史。</p>
          </motion.section>
        ) : null}

        <div className="mt-7 flex flex-wrap justify-center gap-1 sm:gap-3">
          <button type="button" onClick={dislike} className="quiet-button text-sm"><ThumbsDown size={17} aria-hidden="true" />不想吃这个</button>
          <Link href="/candidates" className="quiet-button text-sm"><ArrowRight size={17} aria-hidden="true" />查看其他候选</Link>
          <Link href="/choose/preferences" className="quiet-button text-sm"><SlidersHorizontal size={17} aria-hidden="true" />修改筛选</Link>
        </div>
      </motion.div>
    </div>
  );
}
