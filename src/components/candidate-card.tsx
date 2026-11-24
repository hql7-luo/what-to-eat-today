"use client";

import { Clock3, Flame, Tags } from "lucide-react";

import { DishImage } from "@/components/dish-image";
import { spiceLevelLabels, useI18n } from "@/lib/i18n";
import type { RecommendationCandidate } from "@/types";

const relaxedKeys = {
  budget: "relaxedBudget",
  goal: "relaxedGoal",
  wait: "relaxedWait",
} as const;

export function CandidateCard({
  candidate,
  compact = false,
}: {
  candidate: RecommendationCandidate;
  compact?: boolean;
}) {
  const { dish } = candidate;
  const { t, locale, dish: dishLabel, category } = useI18n();
  return (
    // text-ink-900: the draw page sets light text on its dark background; the white card must not inherit it.
    <article className={`group ticket-card overflow-hidden text-ink-900 ${compact ? "flex h-[300px] w-[188px] shrink-0 flex-col sm:w-[208px]" : "h-full"}`}>
      <DishImage dish={dish} variant={compact ? "compact" : "hero"} />
      <div className={compact ? "flex-1 p-4" : "p-5 sm:p-6"}>
        <div className="mb-2 flex items-start justify-between gap-2">
          <h2 className={`${compact ? "line-clamp-2 min-h-10 text-lg" : "text-xl"} font-black leading-tight`}>{dishLabel(dish.name)}</h2>
          <span className="numeric-type shrink-0 rounded-full bg-yolk-400/25 px-2 py-1 text-xs font-black">
            ¥{dish.priceRange[0]}–{dish.priceRange[1]}
          </span>
        </div>
        <p className="truncate text-sm font-semibold text-ink-700">{category(dish.category)}</p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs font-medium text-ink-500">
          <span className="inline-flex items-center gap-1"><Flame size={13} aria-hidden="true" />{spiceLevelLabels[locale][dish.spiceLevel]}</span>
          <span className="inline-flex items-center gap-1"><Clock3 size={13} aria-hidden="true" />{t("prepAbout", { min: dish.prepTime })}</span>
          {!compact ? <span className="inline-flex items-center gap-1"><Tags size={13} aria-hidden="true" />{t("priceRangeTag")}</span> : null}
        </div>
        {!compact ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {[dish.fatLossFriendly ? t("fatLossFriendly") : null, dish.muscleGainFriendly ? t("muscleGainFriendly") : null, ...candidate.relaxedConstraints.map((item) => t(relaxedKeys[item]))]
              .filter(Boolean)
              .map((tag) => <span key={tag} className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-bold text-ink-700">{tag}</span>)}
          </div>
        ) : null}
      </div>
    </article>
  );
}
