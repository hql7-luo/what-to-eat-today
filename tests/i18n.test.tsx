import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("motion/react", async () => {
  const { forwardRef } = await import("react");
  const passthrough = (tag: "div" | "section") =>
    forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(function MockMotion({ children, ...props }, ref) {
      const Tag = tag;
      return <Tag ref={ref as never} {...props}>{children}</Tag>;
    });
  return { motion: { div: passthrough("div"), section: passthrough("section") } };
});

import ResultPage from "@/app/result/page";
import { dishCategories, dishes } from "@/data/dishes";
import { useAppStore } from "@/features/store/use-app-store";
import { categoryNamesEn, dishNamesEn } from "@/lib/i18n/dishes";
import { detectLocale, LANGUAGE_KEY, setLocale } from "@/lib/i18n/locale";
import { messages } from "@/lib/i18n/messages";
import { formatReason, reasonCode } from "@/lib/i18n/reasons";
import { recommendDishes } from "@/lib/recommendation";
import { DEFAULT_PREFERENCES } from "@/types";

let root: Root | undefined;
let container: HTMLDivElement;

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  if (root) act(() => root?.unmount());
  root = undefined;
  container.remove();
  act(() => setLocale("zh"));
});

describe("English and Chinese text", () => {
  it("has an English name for every dish and category", () => {
    expect(dishes).toHaveLength(92);
    for (const dish of dishes) expect(dishNamesEn[dish.name], dish.name).toBeTruthy();
    for (const category of dishCategories) expect(categoryNamesEn[category], category).toBeTruthy();
    expect(new Set(Object.values(dishNamesEn)).size).toBe(92);
  });

  it("has the same message keys in both languages, none empty", () => {
    expect(Object.keys(messages.en).sort()).toEqual(Object.keys(messages.zh).sort());
    for (const locale of ["zh", "en"] as const) {
      for (const [key, value] of Object.entries(messages[locale])) expect(value.trim(), `${locale}.${key}`).not.toBe("");
    }
  });

  it("words every reason code in both languages and shows old saved sentences unchanged", () => {
    const codes = [reasonCode.budget(18, 32), reasonCode.goal("fat-loss"), reasonCode.goal("muscle-gain"), reasonCode.goal("light"),
      reasonCode.goal("indulgent"), reasonCode.wait(24), reasonCode.recent, reasonCode.general];
    for (const code of codes) {
      expect(formatReason(code, "zh")).toMatch(/[一-龥]/);
      expect(formatReason(code, "en")).not.toMatch(/[一-龥]/);
    }
    expect(formatReason(reasonCode.budget(18, 32), "en")).toBe("Typical price ¥18–32 fits your budget");
    expect(formatReason("2–3 天前吃过，已降低推荐权重", "en")).toBe("2–3 天前吃过，已降低推荐权重");
  });

  it("recommendations carry reason codes, not finished sentences", () => {
    const [candidate] = recommendDishes({ dishes, preferences: { ...DEFAULT_PREFERENCES, budget: "20to30" }, random: () => 0, limit: 1 });
    expect(candidate.reasons.length).toBeGreaterThan(0);
    for (const code of candidate.reasons) expect(code).not.toMatch(/[一-龥]/);
  });

  it("chooses the language from ?lang, then the saved choice, then the browser", () => {
    expect(detectLocale()).toBe("zh");
    localStorage.setItem(LANGUAGE_KEY, "en");
    expect(detectLocale()).toBe("en");
    window.history.replaceState(null, "", "/?lang=zh");
    expect(detectLocale()).toBe("zh");
    // ?lang is remembered for later pages opened without it
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe("zh");
    window.history.replaceState(null, "", "/");
    expect(detectLocale()).toBe("zh");
  });

  it("renders the result page in English, with no Chinese left", async () => {
    const candidate = recommendDishes({ dishes, preferences: DEFAULT_PREFERENCES, random: () => 0, limit: 1 })[0];
    useAppStore.setState({
      hasHydrated: true, selectedCandidate: candidate, selectedResultId: "result-en", acceptedResultIds: [],
      frequentShops: [{ id: "shop-en", name: "Corner Deli", dishId: candidate.dishId, dishName: candidate.dish.name, approximatePrice: 26, createdAt: "2026-07-20T12:00:00.000Z" }],
    });
    act(() => setLocale("en"));
    root = createRoot(container);
    await act(async () => root?.render(<ResultPage />));

    const text = container.textContent ?? "";
    expect(text).toContain("Your usual spot");
    expect(text).toContain(`Usually ${dishNamesEn[candidate.dish.name]} · about ¥26`);
    expect(text).toContain(`Typically ¥${candidate.dish.priceRange[0]}–${candidate.dish.priceRange[1]}`);
    expect(text).toContain("Why this pick");
    expect(text).not.toMatch(/[一-龥]/);
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe("en");
  });
});
