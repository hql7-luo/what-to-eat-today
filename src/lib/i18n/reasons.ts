import type { Locale } from "@/lib/i18n/locale";

// Recommendation reasons are stored as short codes and worded at display time.
// Older saved candidates hold finished Chinese sentences; those are shown as they are.
export type ReasonCode = string;

export const reasonCode = {
  budget: (min: number, max: number) => `budget:${min}:${max}`,
  goal: (goal: "fat-loss" | "muscle-gain" | "light" | "indulgent") => `goal:${goal}`,
  wait: (minutes: number) => `wait:${minutes}`,
  recent: "recent",
  general: "general",
} as const;

const goalText: Record<Locale, Record<string, string>> = {
  zh: {
    "fat-loss": "更适合今天的减脂目标",
    "muscle-gain": "蛋白质搭配更符合增肌目标",
    light: "口味和搭配相对清爽",
    indulgent: "更符合今天想犒劳自己的心情",
  },
  en: {
    "fat-loss": "Suits today's fat-loss goal",
    "muscle-gain": "Protein-rich, good for muscle gain",
    light: "Light in flavor and ingredients",
    indulgent: "Fits today's treat-yourself mood",
  },
};

export function formatReason(code: ReasonCode, locale: Locale): string {
  const [kind, a, b] = code.split(":");
  if (kind === "budget" && a && b) {
    return locale === "en" ? `Typical price ¥${a}–${b} fits your budget` : `常见价格 ¥${a}–${b}，符合你的预算`;
  }
  if (kind === "goal" && a && goalText[locale][a]) return goalText[locale][a];
  if (kind === "wait" && a) {
    return locale === "en" ? `Usually ready in about ${a} min, within your wait time` : `通常准备约 ${a} 分钟，符合可接受时间`;
  }
  if (code === reasonCode.recent) return locale === "en" ? "Eaten 2–3 days ago, so weighted lower" : "2–3 天前吃过，已降低推荐权重";
  if (code === reasonCode.general) return locale === "en" ? "A good overall match for today" : "与当前条件整体匹配，适合作为今天的选择";
  return code;
}
