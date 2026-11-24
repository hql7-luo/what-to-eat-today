"use client";

import { ArrowRight, Check, Clock3, Database, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

import { DishImage } from "@/components/dish-image";
import { dishes } from "@/data/dishes";
import { useAppStore } from "@/features/store/use-app-store";
import { useI18n } from "@/lib/i18n";
import { recommendDishes } from "@/lib/recommendation";
import { DEFAULT_PREFERENCES } from "@/types";

const previewDishes = [dishes[0], dishes[48], dishes[78]];

export default function HomePage() {
  const router = useRouter();
  const setCandidates = useAppStore((state) => state.setCandidates);
  const setPreferences = useAppStore((state) => state.setPreferences);
  const startNewRound = useAppStore((state) => state.startNewRound);
  const history = useAppStore((state) => state.history);
  const tasteProfile = useAppStore((state) => state.tasteProfile);
  const { t, locale, dish: dishLabel } = useI18n();

  const surpriseMe = () => {
    startNewRound();
    setPreferences(DEFAULT_PREFERENCES);
    setCandidates(
      recommendDishes({
        dishes,
        preferences: DEFAULT_PREFERENCES,
        history,
        tasteProfile,
        limit: 10,
      }),
    );
    router.push("/roulette");
  };

  const startChoosing = () => {
    startNewRound();
    router.push("/choose/preferences");
  };

  return (
    <div>
      <section className="page-container grid min-h-[calc(100svh-64px)] min-w-0 grid-cols-[minmax(0,1fr)] items-center gap-12 py-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:py-20">
        <motion.div className="min-w-0" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cucumber-500/20 bg-cucumber-100 px-3 py-1.5 text-xs font-black text-ink-700"><Database size={14} aria-hidden="true" />{t("homeBadge")}</span>
          <p className="numeric-type mt-7 text-xs font-black uppercase tracking-[0.22em] text-tomato-600">{t("homeEyebrow")}</p>
          <h1 className={`display-type mt-3 max-w-[760px] font-black leading-[0.86] ${locale === "en" ? "text-[clamp(3.1rem,8.4vw,6.6rem)] tracking-[-0.03em]" : "text-[clamp(3.9rem,10vw,7.8rem)]"}`}>
            {t("homeTitle1")}
            <br />
            <span className="relative inline-block text-tomato-500">
              {t("homeTitle2")}
              <span className="absolute right-0 -top-2 rotate-6 whitespace-nowrap rounded-md bg-yolk-400 px-2 py-1 text-[11px] font-black tracking-normal text-ink-900 shadow-sm sm:-right-16 sm:rotate-12 sm:text-sm">{t("homeSticker")}</span>
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-ink-700 sm:text-xl">
            {t("homeLead")}
          </p>
          <div className="mt-9 flex min-w-0 flex-col gap-3 sm:flex-row">
            <button type="button" onClick={startChoosing} className="primary-button min-w-0 w-full px-5 text-base sm:w-auto sm:px-7">
              {t("homeStart")} <ArrowRight size={19} aria-hidden="true" />
            </button>
            <button type="button" onClick={surpriseMe} className="secondary-button min-w-0 w-full px-5 text-base sm:w-auto sm:px-7">
              <Sparkles size={18} aria-hidden="true" /> {t("homeSurprise")}
            </button>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink-500">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={17} aria-hidden="true" />{t("homeNoLogin")}</span>
            <span className="inline-flex items-center gap-1.5"><Check size={17} aria-hidden="true" />{t("homeLocal")}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.62, delay: 0.08 }}
          className="relative mx-auto min-w-0 w-full max-w-full sm:max-w-[620px]"
          aria-label={t("homePreviewAria")}
        >
          <div className="absolute -inset-2 -z-10 rounded-[42px] border-2 border-dashed border-ink-900/15 bg-yolk-400/20 sm:-inset-4 sm:rotate-2" />
          <div className="overflow-hidden rounded-[34px] border-[5px] border-ink-900 bg-ink-900 p-3 shadow-[0_28px_70px_rgb(24_35_29_/_0.22)] sm:p-5">
            <div className="mb-4 flex items-center justify-between px-1 text-white">
              <div>
                <p className="numeric-type text-[10px] font-black tracking-[0.2em] text-white/55">LUNCH DROP</p>
                <p className="mt-1 text-sm font-bold">{t("homePool")}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">{t("homePoolCount")}</span>
            </div>
            <div className="relative overflow-hidden rounded-[24px] bg-rice-100 py-6">
              <div className="absolute bottom-0 left-1/2 top-0 z-20 w-[3px] -translate-x-1/2 bg-tomato-500 shadow-[0_0_18px_#ee4d38]" />
              <div className="absolute left-1/2 top-0 z-30 -translate-x-1/2 rounded-b-lg bg-tomato-500 px-3 py-1 text-[10px] font-black text-white">{t("todayTicket")}</div>
              <motion.div
                className="flex w-max gap-3 px-5"
                animate={{ x: [0, -125, 0] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                {[...previewDishes, ...previewDishes].map((dish, index) => (
                  <div key={`${dish.id}-${index}`} className="group w-36 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-rice-50 shadow-md">
                    <DishImage dish={dish} variant="compact" />
                    <p className="truncate px-3 py-3 text-sm font-black">{dishLabel(dish.name)}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
          <div className="absolute -bottom-5 left-2 flex rotate-2 items-center gap-2 rounded-xl border border-black/10 bg-rice-50 px-3 py-2.5 text-xs font-bold shadow-lg sm:left-10 sm:px-4 sm:py-3 sm:text-sm">
            <Database size={17} className="text-tomato-500" aria-hidden="true" /> {t("homeDishCount")}
          </div>
          <div className="absolute right-0 -top-5 flex -rotate-3 items-center gap-2 rounded-xl border border-black/10 bg-yolk-400 px-3 py-2.5 text-xs font-black shadow-lg sm:right-5 sm:px-4 sm:py-3 sm:text-sm">
            <Clock3 size={17} aria-hidden="true" /> {t("homeSteps")}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-black/8 bg-ink-900 py-7 text-rice-50">
        <div className="page-container grid gap-6 text-center sm:grid-cols-3">
          {[['05', t("homeStatQuestions")], ['10', t("homeStatPicks")], ['00', t("homeStatAccounts")]].map(([value, label]) => (
            <div key={label} className="flex items-baseline justify-center gap-3">
              <span className="numeric-type text-4xl font-black text-yolk-400">{value}</span>
              <span className="text-sm font-bold text-white/70">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
