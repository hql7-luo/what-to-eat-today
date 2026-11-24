"use client";

import { ChevronDown, LoaderCircle, RotateCcw, Sparkles, Volume2, VolumeX } from "lucide-react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { CandidateCard } from "@/components/candidate-card";
import { EmptyState } from "@/components/empty-state";
import { PageLoading } from "@/components/page-loading";
import { useAppStore } from "@/features/store/use-app-store";
import { useI18n } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/messages";
import { selectWeightedCandidate } from "@/lib/recommendation";
import { buildRouletteTrack, ROULETTE_TARGET_INDEX } from "@/lib/roulette/track";
import type { RecommendationCandidate } from "@/types";

const TRACK_GAP = 14;

function playResultSound() {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.setValueAtTime(520, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.14);
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.21);
  } catch {
    // 浏览器禁用音频时保持静默，不影响抽取流程。
  }
}

export default function RoulettePage() {
  const router = useRouter();
  const controls = useAnimationControls();
  const reduceMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);
  const spinningRef = useRef(false);
  const candidates = useAppStore((state) => state.candidates);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const sessionExcludedDishIds = useAppStore((state) => state.sessionExcludedDishIds);
  const soundEnabled = useAppStore((state) => state.soundEnabled);
  const toggleSound = useAppStore((state) => state.toggleSound);
  const setSelectedCandidate = useAppStore((state) => state.setSelectedCandidate);
  const activeCandidates = useMemo(
    () => candidates.filter((candidate) => !sessionExcludedDishIds.includes(candidate.dishId)),
    [candidates, sessionExcludedDishIds],
  );
  const [track, setTrack] = useState<RecommendationCandidate[]>([]);
  const [spinning, setSpinning] = useState(false);
  // Kept as a message key (plus the dish's stored name) so it follows a language switch.
  const [announcement, setAnnouncement] = useState<{ key: MessageKey; name?: string }>({ key: "roulReady" });
  const { t, dish: dishLabel } = useI18n();

  useEffect(() => {
    if (!hasHydrated || spinningRef.current) return;
    setTrack(buildRouletteTrack(activeCandidates));
    controls.set({ x: 0 });
  }, [activeCandidates, controls, hasHydrated]);

  const start = async () => {
    if (spinningRef.current || activeCandidates.length === 0) return;
    const winner = selectWeightedCandidate(activeCandidates);
    if (!winner) return;
    spinningRef.current = true;
    setSpinning(true);
    setAnnouncement({ key: "roulDrawing" });
    const nextTrack = buildRouletteTrack(activeCandidates, winner);
    setTrack(nextTrack);
    controls.set({ x: 0 });

    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const viewportWidth = viewportRef.current?.clientWidth ?? window.innerWidth;
      const cardWidth = firstCardRef.current?.clientWidth ?? 208;
      const targetCenter = ROULETTE_TARGET_INDEX * (cardWidth + TRACK_GAP) + cardWidth / 2;
      const targetX = viewportWidth / 2 - targetCenter;
      await controls.start({
        x: targetX,
        transition: {
          duration: reduceMotion ? 0.45 : 4.15,
          ease: reduceMotion ? "easeOut" : [0.08, 0.76, 0.12, 1],
        },
      });
      setSelectedCandidate(winner);
      setAnnouncement({ key: "roulResult", name: winner.dish.name });
      if (soundEnabled) playResultSound();
      if (navigator.vibrate && !reduceMotion) navigator.vibrate([35, 45, 70]);
      window.setTimeout(() => router.push("/result"), reduceMotion ? 150 : 650);
    } catch {
      spinningRef.current = false;
      setSpinning(false);
      setAnnouncement({ key: "roulFailed" });
    }
  };

  if (!hasHydrated) return <PageLoading />;

  if (candidates.length === 0) {
    return <div className="page-container py-16"><EmptyState title={t("roulEmptyTitle")} description={t("roulEmptyDescription")} href="/choose/preferences" action={t("roulEmptyAction")} /></div>;
  }

  if (activeCandidates.length === 0) {
    return <div className="page-container py-16"><EmptyState title={t("roulDoneTitle")} description={t("roulDoneDescription")} href="/choose/preferences" action={t("roulDoneAction")} /></div>;
  }

  return (
    <div className="min-h-[calc(100svh-64px)] overflow-hidden bg-ink-900 py-8 text-rice-50 sm:py-12">
      <div className="page-container mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="numeric-type mb-3 text-xs font-black uppercase tracking-[0.2em] text-yolk-400">Lunch drop · {activeCandidates.length} choices</p>
          <h1 className="display-type text-4xl font-black sm:text-5xl">{t("roulTitle")}</h1>
          <p className="mt-2 text-sm font-medium text-white/58">{t("roulSubtitle")}</p>
        </div>
        <button type="button" onClick={toggleSound} className="grid size-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/8 hover:bg-white/14" aria-label={soundEnabled ? t("roulSoundOff") : t("roulSoundOn")}>
          {soundEnabled ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
        </button>
      </div>

      <section aria-label={t("roulTrackAria")} className="relative border-y border-white/10 bg-black/18 py-10 sm:py-14">
        <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-30 w-[3px] -translate-x-1/2 bg-tomato-500 shadow-[0_0_28px_#ee4d38]" />
        <div className="pointer-events-none absolute left-1/2 top-0 z-40 -translate-x-1/2 text-center">
          <ChevronDown className="mx-auto fill-tomato-500 text-tomato-500" size={34} aria-hidden="true" />
          <span className="-mt-1 block rounded-full bg-tomato-500 px-3 py-1 text-[10px] font-black tracking-[0.14em] text-white">{t("todayTicket")}</span>
        </div>
        <div ref={viewportRef} className="overflow-hidden py-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <motion.div animate={controls} className="flex w-max pl-4 will-change-transform" style={{ gap: TRACK_GAP }}>
            {track.map((candidate, index) => (
              <div key={`${candidate.id}-${index}`} ref={index === 0 ? firstCardRef : undefined} className={spinning ? "[filter:saturate(1.08)]" : ""}>
                <CandidateCard candidate={candidate} compact />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="page-container mt-8 text-center">
        <p className="sr-only" aria-live="assertive">{t(announcement.key, announcement.name ? { name: dishLabel(announcement.name) } : undefined)}</p>
        <p aria-hidden="true" className="min-h-6 text-sm font-semibold text-white/55">{spinning ? t("roulSlowing") : t("roulExcluded", { count: sessionExcludedDishIds.length })}</p>
        <button type="button" onClick={start} disabled={spinning} className="primary-button mt-5 min-w-56 px-9 text-lg">
          {spinning ? <><LoaderCircle size={20} className="animate-spin" aria-hidden="true" />{t("roulSpinning")}</> : <><Sparkles size={20} aria-hidden="true" />{t("roulStart")}</>}
        </button>
        <button type="button" disabled={spinning} onClick={() => router.push("/candidates")} className="quiet-button mx-auto mt-3 text-sm text-white/65 hover:bg-white/8">
          <RotateCcw size={16} aria-hidden="true" />{t("roulBack")}
        </button>
      </div>
    </div>
  );
}
