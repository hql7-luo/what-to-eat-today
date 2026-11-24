"use client";

import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Beef,
  Clock3,
  Flame,
  HeartPulse,
  Leaf,
  PartyPopper,
  Soup,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FlowHeading } from "@/components/flow-heading";
import { PageLoading } from "@/components/page-loading";
import { useAppStore } from "@/features/store/use-app-store";
import { useI18n, type Locale } from "@/lib/i18n";
import type { Preferences } from "@/types";

type PreferenceKey = keyof Preferences;
type Option = { value: Preferences[PreferenceKey]; label: string; hint: string; icon: typeof Banknote };

type Question = { key: PreferenceKey; eyebrow: string; title: string; description: string; options: Option[] };

const questionsByLocale: Record<Locale, Question[]> = {
  zh: [
    {
      key: "budget", eyebrow: "01 · 预算", title: "今天准备花多少？", description: "按单人或整单预算选就好，候选不足时会温和放宽。",
      options: [
        { value: "under20", label: "20 元以内", hint: "简单管饱", icon: Banknote }, { value: "20to30", label: "20–30 元", hint: "工作日主力", icon: Banknote }, { value: "30to50", label: "30–50 元", hint: "吃得丰盛些", icon: Banknote }, { value: "over50", label: "50 元以上", hint: "认真犒劳", icon: PartyPopper }, { value: "any", label: "不限", hint: "先看想吃什么", icon: Zap },
      ],
    },
    {
      key: "spice", eyebrow: "02 · 辣度", title: "今天能吃多辣？", description: "所选辣度代表可接受上限，不会用重辣偷袭你。",
      options: [
        { value: "none", label: "不吃辣", hint: "完全不辣", icon: Soup }, { value: "mild", label: "微辣", hint: "一点点提味", icon: Flame }, { value: "medium", label: "中辣", hint: "有明显辣感", icon: Flame }, { value: "hot", label: "重辣", hint: "越辣越来劲", icon: Flame }, { value: "any", label: "都可以", hint: "看缘分", icon: Zap },
      ],
    },
    {
      key: "goal", eyebrow: "03 · 饮食目标", title: "这顿饭想怎么吃？", description: "不做复杂营养计算，只把更匹配的菜排在前面。",
      options: [
        { value: "normal", label: "正常吃", hint: "均衡就好", icon: Utensils }, { value: "fat-loss", label: "减脂", hint: "偏高蛋白、少负担", icon: Leaf }, { value: "muscle-gain", label: "增肌", hint: "更看重蛋白质", icon: Beef }, { value: "light", label: "清淡一点", hint: "少油少刺激", icon: HeartPulse }, { value: "indulgent", label: "今天想放纵", hint: "快乐优先", icon: PartyPopper },
      ],
    },
    {
      key: "partySize", eyebrow: "04 · 人数", title: "这顿几个人吃？", description: "人数会影响火锅、披萨、烧烤等分享型候选。",
      options: [
        { value: "1", label: "1 人", hint: "独享午餐", icon: Users }, { value: "2", label: "2 人", hint: "两人搭伙", icon: Users }, { value: "3-4", label: "3–4 人", hint: "小组开饭", icon: Users }, { value: "5+", label: "5 人以上", hint: "一起点更划算", icon: Users },
      ],
    },
    {
      key: "maxWait", eyebrow: "05 · 可接受时间", title: "最多愿意等多久？", description: "按菜品通常所需的准备时间筛选，不代表任何店铺的实时配送时间。",
      options: [
        { value: 20, label: "20 分钟内", hint: "十万火急", icon: Zap }, { value: 30, label: "30 分钟内", hint: "午休标准", icon: Clock3 }, { value: 45, label: "45 分钟内", hint: "可以等等", icon: Clock3 }, { value: 60, label: "60 分钟内", hint: "慢慢挑", icon: Clock3 }, { value: null, label: "不限", hint: "好吃更重要", icon: Soup },
      ],
    },
  ],
  en: [
    {
      key: "budget", eyebrow: "01 · Budget", title: "How much will you spend today?", description: "Pick per person or for the whole order. If there are too few picks, it relaxes a little.",
      options: [
        { value: "under20", label: "Under ¥20", hint: "Simple and filling", icon: Banknote }, { value: "20to30", label: "¥20–30", hint: "Weekday staple", icon: Banknote }, { value: "30to50", label: "¥30–50", hint: "Something hearty", icon: Banknote }, { value: "over50", label: "Over ¥50", hint: "Treat yourself", icon: PartyPopper }, { value: "any", label: "Any", hint: "Decide by craving", icon: Zap },
      ],
    },
    {
      key: "spice", eyebrow: "02 · Spice", title: "How spicy can you go today?", description: "Your choice is the upper limit. No surprise heat.",
      options: [
        { value: "none", label: "No spice", hint: "Not spicy at all", icon: Soup }, { value: "mild", label: "Mild", hint: "Just a hint", icon: Flame }, { value: "medium", label: "Medium", hint: "Noticeably spicy", icon: Flame }, { value: "hot", label: "Hot", hint: "The hotter the better", icon: Flame }, { value: "any", label: "Anything", hint: "Let fate decide", icon: Zap },
      ],
    },
    {
      key: "goal", eyebrow: "03 · Diet goal", title: "How do you want to eat?", description: "No detailed nutrition math; better matches just rank higher.",
      options: [
        { value: "normal", label: "Regular", hint: "Balanced is fine", icon: Utensils }, { value: "fat-loss", label: "Fat loss", hint: "Lean protein, lighter", icon: Leaf }, { value: "muscle-gain", label: "Muscle gain", hint: "Protein first", icon: Beef }, { value: "light", label: "Light", hint: "Less oil, less heat", icon: HeartPulse }, { value: "indulgent", label: "Indulge", hint: "Happiness first", icon: PartyPopper },
      ],
    },
    {
      key: "partySize", eyebrow: "04 · Party size", title: "How many people are eating?", description: "Party size affects shareable picks like hot pot, pizza and barbecue.",
      options: [
        { value: "1", label: "1 person", hint: "Solo lunch", icon: Users }, { value: "2", label: "2 people", hint: "A pair", icon: Users }, { value: "3-4", label: "3–4 people", hint: "Small group", icon: Users }, { value: "5+", label: "5 or more", hint: "Better to order together", icon: Users },
      ],
    },
    {
      key: "maxWait", eyebrow: "05 · Wait time", title: "How long can you wait?", description: "Filters by each dish's usual prep time, not any shop's live delivery time.",
      options: [
        { value: 20, label: "Within 20 min", hint: "In a rush", icon: Zap }, { value: 30, label: "Within 30 min", hint: "Lunch-break standard", icon: Clock3 }, { value: 45, label: "Within 45 min", hint: "Can wait a bit", icon: Clock3 }, { value: 60, label: "Within 60 min", hint: "Take your time", icon: Clock3 }, { value: null, label: "No limit", hint: "Taste matters more", icon: Soup },
      ],
    },
  ],
};

export default function PreferencesPage() {
  const router = useRouter();
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const preferences = useAppStore((state) => state.preferences);
  const setPreferences = useAppStore((state) => state.setPreferences);
  const [step, setStep] = useState(0);
  const { t, locale } = useI18n();
  const questions = questionsByLocale[locale];
  const question = questions[step];
  const value = preferences[question.key];

  const choose = (nextValue: Preferences[PreferenceKey]) => {
    setPreferences({ [question.key]: nextValue });
  };

  if (!hasHydrated) return <PageLoading />;

  return (
    <div className="page-container py-8 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <FlowHeading eyebrow={t("prefEyebrow", { step: step + 1 })} title={t("prefTitle")} description={t("prefDescription")} backHref={step === 0 ? "/" : undefined} />
        <div className="mb-7 flex gap-2" aria-label={t("prefStepAria", { step: step + 1 })}>
          {questions.map((item, index) => <span key={item.key} className={`h-1.5 flex-1 rounded-full transition-colors ${index <= step ? "bg-tomato-500" : "bg-black/10"}`} />)}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.section key={question.key} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }} className="ticket-card p-6 sm:p-9">
            <p className="numeric-type text-xs font-black tracking-[0.18em] text-tomato-600">{question.eyebrow}</p>
            <h2 className="display-type mt-2 text-3xl font-black sm:text-4xl">{question.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500 sm:text-base">{question.description}</p>
            <div className={`mt-7 grid gap-3 ${question.options.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`} role="group" aria-label={question.title}>
              {question.options.map((option) => {
                const selected = value === option.value;
                const Icon = option.icon;
                return (
                  <button
                    type="button"
                    key={String(option.value)}
                    onClick={() => choose(option.value)}
                    aria-pressed={selected}
                    className={`group flex min-h-[92px] items-center gap-4 rounded-[22px] border p-4 text-left transition-all ${selected ? "border-ink-900 bg-ink-900 text-white shadow-[0_5px_0_#f3b53f]" : "border-black/12 bg-white/45 hover:-translate-y-0.5 hover:border-black/30 hover:bg-white/80"}`}
                  >
                    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${selected ? "bg-yolk-400 text-ink-900" : "bg-black/6 text-ink-700"}`}><Icon size={21} aria-hidden="true" /></span>
                    <span><span className="block font-black">{option.label}</span><span className={`mt-1 block text-xs font-medium ${selected ? "text-white/65" : "text-ink-500"}`}>{option.hint}</span></span>
                  </button>
                );
              })}
            </div>
          </motion.section>
        </AnimatePresence>

        <div className="bottom-safe sticky bottom-0 z-30 mt-7 flex items-center justify-between gap-3 border-t border-black/10 bg-[linear-gradient(180deg,transparent_0%,#f8f1e4_25%)] pt-7 sm:static sm:bg-none">
          <button type="button" className="quiet-button px-3" onClick={() => step === 0 ? router.push("/") : setStep((current) => current - 1)}>
            <ArrowLeft size={18} aria-hidden="true" /> {t("prefPrevious")}
          </button>
          {step < questions.length - 1 ? (
            <button type="button" className="primary-button px-7" onClick={() => setStep((current) => current + 1)}>
              {t("prefNext")} <ArrowRight size={18} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" className="primary-button px-7" onClick={() => router.push("/candidates")}>
              {t("prefFinish")} <ArrowRight size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
