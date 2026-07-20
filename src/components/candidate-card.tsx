import { Clock3, Flame, Tags } from "lucide-react";

import { DishImage } from "@/components/dish-image";
import type { RecommendationCandidate } from "@/types";

const relaxedLabels = {
  budget: "预算已放宽",
  goal: "饮食目标已放宽",
  wait: "时间已放宽",
} as const;

const spiceLabels = ["不辣", "微辣", "中辣", "重辣"] as const;

export function CandidateCard({
  candidate,
  compact = false,
}: {
  candidate: RecommendationCandidate;
  compact?: boolean;
}) {
  const { dish } = candidate;
  return (
    <article className={`group ticket-card overflow-hidden ${compact ? "flex h-[300px] w-[188px] shrink-0 flex-col sm:w-[208px]" : "h-full"}`}>
      <DishImage dish={dish} variant={compact ? "compact" : "hero"} />
      <div className={compact ? "flex-1 p-4" : "p-5 sm:p-6"}>
        <div className="mb-2 flex items-start justify-between gap-2">
          <h2 className={`${compact ? "line-clamp-2 min-h-10 text-lg" : "text-xl"} font-black leading-tight`}>{dish.name}</h2>
          <span className="numeric-type shrink-0 rounded-full bg-yolk-400/25 px-2 py-1 text-xs font-black">
            ¥{dish.priceRange[0]}–{dish.priceRange[1]}
          </span>
        </div>
        <p className="truncate text-sm font-semibold text-ink-700">{dish.category}</p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs font-medium text-ink-500">
          <span className="inline-flex items-center gap-1"><Flame size={13} aria-hidden="true" />{spiceLabels[dish.spiceLevel]}</span>
          <span className="inline-flex items-center gap-1"><Clock3 size={13} aria-hidden="true" />通常约 {dish.prepTime} 分钟</span>
          {!compact ? <span className="inline-flex items-center gap-1"><Tags size={13} aria-hidden="true" />常见价格区间</span> : null}
        </div>
        {!compact ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {[dish.fatLossFriendly ? "减脂友好" : null, dish.muscleGainFriendly ? "增肌友好" : null, ...candidate.relaxedConstraints.map((item) => relaxedLabels[item])]
              .filter(Boolean)
              .map((tag) => <span key={tag} className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-bold text-ink-700">{tag}</span>)}
          </div>
        ) : null}
      </div>
    </article>
  );
}
