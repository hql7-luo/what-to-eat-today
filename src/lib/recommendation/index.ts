import type {
  BudgetOption,
  DietGoal,
  Dish,
  HistoryEntry,
  PartySize,
  Preferences,
  RecommendationCandidate,
  RelaxedConstraint,
  SpicePreference,
  TasteProfile,
} from "@/types";

const budgetRanges: Record<BudgetOption, [number, number]> = {
  under20: [0, 20],
  "20to30": [20, 30],
  "30to50": [30, 50],
  over50: [50, Number.POSITIVE_INFINITY],
  any: [0, Number.POSITIVE_INFINITY],
};

const spiceCeilings: Record<SpicePreference, number> = {
  none: 0,
  mild: 1,
  medium: 2,
  hot: 3,
  any: 3,
};

const indulgentCategories = new Set(["火锅", "烧烤", "汉堡", "炸鸡", "披萨", "奶茶"]);
const lightCategories = new Set(["轻食", "沙拉", "粥", "馄饨", "粤菜"]);
const beverageCategories = new Set(["奶茶", "咖啡"]);

export interface RecommendationInput {
  dishes: Dish[];
  preferences: Preferences;
  history?: HistoryEntry[];
  tasteProfile?: TasteProfile;
  excludedDishIds?: string[];
  dislikedDishIds?: string[];
  limit?: number;
  now?: Date;
  random?: () => number;
}

function calendarDaysBetween(dateIso: string, now: Date): number {
  const selected = new Date(dateIso);
  const start = Date.UTC(selected.getFullYear(), selected.getMonth(), selected.getDate());
  const end = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((end - start) / 86_400_000);
}

function goalMatches(dish: Dish, goal: DietGoal): boolean {
  if (goal === "normal") return true;
  if (goal === "fat-loss") return dish.fatLossFriendly;
  if (goal === "muscle-gain") return dish.muscleGainFriendly;
  if (goal === "light") return dish.fatLossFriendly || lightCategories.has(dish.category);
  return indulgentCategories.has(dish.category);
}

function partyMatches(dish: Dish, party: PartySize): boolean {
  return dish.suitableParties.includes(party);
}

function budgetDistance(priceRange: [number, number], budget: BudgetOption): number {
  const [budgetMin, budgetMax] = budgetRanges[budget];
  const [dishMin, dishMax] = priceRange;
  if (dishMax < budgetMin) return budgetMin - dishMax;
  if (dishMin > budgetMax) return dishMin - budgetMax;
  return 0;
}

function buildReasons(
  dish: Dish,
  preferences: Preferences,
  recentPenalty: boolean,
): string[] {
  const reasons: string[] = [];
  if (preferences.budget !== "any" && budgetDistance(dish.priceRange, preferences.budget) === 0) {
    reasons.push(`常见价格 ¥${dish.priceRange[0]}–${dish.priceRange[1]}，符合你的预算`);
  }
  if (preferences.goal === "fat-loss" && dish.fatLossFriendly) reasons.push("更适合今天的减脂目标");
  if (preferences.goal === "muscle-gain" && dish.muscleGainFriendly) reasons.push("蛋白质搭配更符合增肌目标");
  if (preferences.goal === "light" && goalMatches(dish, "light")) reasons.push("口味和搭配相对清爽");
  if (preferences.goal === "indulgent" && goalMatches(dish, "indulgent")) reasons.push("更符合今天想犒劳自己的心情");
  if (preferences.maxWait !== null && dish.prepTime <= preferences.maxWait) {
    reasons.push(`通常准备约 ${dish.prepTime} 分钟，符合可接受时间`);
  }
  if (recentPenalty) reasons.push("2–3 天前吃过，已降低推荐权重");
  if (reasons.length === 0) reasons.push("与当前条件整体匹配，适合作为今天的选择");
  return reasons.slice(0, 3);
}

type ScoredDish = RecommendationCandidate & { constraintLevel: number };

function scoreDish(dish: Dish, input: RecommendationInput, constraintLevel: number): ScoredDish | null {
  const {
    preferences,
    history = [],
    tasteProfile,
    excludedDishIds = [],
    dislikedDishIds = [],
    now = new Date(),
    random = Math.random,
  } = input;

  if (excludedDishIds.includes(dish.id) || dislikedDishIds.includes(dish.id)) return null;

  const dishHistory = history.filter((entry) => entry.dishId === dish.id && entry.status === "accepted");
  const ateYesterday = dishHistory.some((entry) => calendarDaysBetween(entry.selectedAt, now) === 1);
  if (ateYesterday) return null;

  const recentPenalty = dishHistory.some((entry) => {
    const days = calendarDaysBetween(entry.selectedAt, now);
    return days >= 2 && days <= 3;
  });
  const dislikedBefore = history.some((entry) => entry.dishId === dish.id && entry.status === "disliked");
  const budgetGap = budgetDistance(dish.priceRange, preferences.budget);
  const spiceMatches = dish.spiceLevel <= spiceCeilings[preferences.spice];
  const dietMatches = goalMatches(dish, preferences.goal);
  const waitMatches = preferences.maxWait === null || dish.prepTime <= preferences.maxWait;
  const servesParty = partyMatches(dish, preferences.partySize);
  const relaxedConstraints: RelaxedConstraint[] = [];
  if (budgetGap > 0) relaxedConstraints.push("budget");
  if (!dietMatches) relaxedConstraints.push("goal");
  if (!waitMatches) relaxedConstraints.push("wait");

  if (constraintLevel === 0 && (!spiceMatches || !dietMatches || !waitMatches || !servesParty || budgetGap > 0)) return null;
  if (constraintLevel === 1 && (!spiceMatches || !servesParty || budgetGap > 10)) return null;
  if (constraintLevel === 2 && (!spiceMatches || !servesParty)) return null;

  let score = 48;
  score += dietMatches ? 15 : -9;
  score += waitMatches ? 10 : -Math.min(16, (dish.prepTime - (preferences.maxWait ?? dish.prepTime)) * 0.8);
  score += budgetGap === 0 ? 14 : -Math.min(24, budgetGap * 1.6);
  score += preferences.spice === "hot" && dish.spiceLevel >= 2 ? 7 : spiceMatches ? 3 : -20;
  score += (tasteProfile?.categoryWeights[dish.category] ?? 0) * 2.5;
  score += random() * 7;
  score *= constraintLevel === 0 ? 1 : constraintLevel === 1 ? 0.72 : 0.5;
  if (recentPenalty) score *= 0.35;
  if (dislikedBefore) score *= 0.28;
  if (beverageCategories.has(dish.category) && preferences.goal !== "indulgent") score *= 0.62;

  return {
    id: dish.id,
    dishId: dish.id,
    dish,
    score: Math.max(0.1, Math.round(score * 100) / 100),
    reasons: buildReasons(dish, preferences, recentPenalty),
    relaxedConstraints,
    constraintLevel,
  };
}

function selectDiverseDishes(candidates: Iterable<ScoredDish>, limit: number): ScoredDish[] {
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  const selected: ScoredDish[] = [];
  const categoryCounts = new Map<string, number>();
  let beverageCount = 0;

  for (const candidate of sorted) {
    if (selected.length >= limit) break;
    const categoryCount = categoryCounts.get(candidate.dish.category) ?? 0;
    const isBeverage = beverageCategories.has(candidate.dish.category);
    if (categoryCount >= 2 || (isBeverage && beverageCount >= 1)) continue;
    selected.push(candidate);
    categoryCounts.set(candidate.dish.category, categoryCount + 1);
    if (isBeverage) beverageCount += 1;
  }

  for (const candidate of sorted) {
    if (selected.length >= limit) break;
    if (selected.some((item) => item.dishId === candidate.dishId)) continue;
    if (beverageCategories.has(candidate.dish.category) && beverageCount >= 1) continue;
    selected.push(candidate);
    if (beverageCategories.has(candidate.dish.category)) beverageCount += 1;
  }

  return selected;
}

export function recommendDishes(input: RecommendationInput): RecommendationCandidate[] {
  const limit = input.limit ?? 10;
  const candidates = new Map<string, ScoredDish>();

  for (let level = 0; level <= 2; level += 1) {
    for (const dish of input.dishes) {
      if (candidates.has(dish.id)) continue;
      const candidate = scoreDish(dish, input, level);
      if (candidate) candidates.set(candidate.id, candidate);
    }
    if (selectDiverseDishes(candidates.values(), limit).length >= limit) break;
  }

  return selectDiverseDishes(candidates.values(), limit).map(({ constraintLevel, ...candidate }) => {
    void constraintLevel;
    return candidate;
  });
}

export function selectWeightedCandidate(
  candidates: RecommendationCandidate[],
  random: () => number = Math.random,
): RecommendationCandidate | undefined {
  if (candidates.length === 0) return undefined;
  const weights = candidates.map((candidate) => Math.pow(Math.max(candidate.score, 0.1), 1.12));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = random() * total;
  for (let index = 0; index < candidates.length; index += 1) {
    cursor -= weights[index];
    if (cursor <= 0) return candidates[index];
  }
  return candidates[candidates.length - 1];
}

export function budgetLabel(budget: BudgetOption): string {
  return {
    under20: "20 元以内",
    "20to30": "20–30 元",
    "30to50": "30–50 元",
    over50: "50 元以上",
    any: "预算不限",
  }[budget];
}
