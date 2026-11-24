"use client";

import { BarChart3, Bookmark, Clock3, History, Plus, RotateCcw, ShieldCheck, Store, Trash2, Utensils, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { DishImage } from "@/components/dish-image";
import { PageLoading } from "@/components/page-loading";
import { dishes, dishesById } from "@/data/dishes";
import { useAppStore } from "@/features/store/use-app-store";
import { budgetLabel, spicePreferenceLabels, useI18n } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/messages";

const dateFormatters = {
  zh: new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
  en: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
};

export default function TastePage() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const history = useAppStore((state) => state.history);
  const tasteProfile = useAppStore((state) => state.tasteProfile);
  const preferences = useAppStore((state) => state.preferences);
  const frequentShops = useAppStore((state) => state.frequentShops);
  const addFrequentShop = useAppStore((state) => state.addFrequentShop);
  const removeFrequentShop = useAppStore((state) => state.removeFrequentShop);
  const clearHistory = useAppStore((state) => state.clearHistory);
  const resetPreferences = useAppStore((state) => state.resetPreferences);
  const [shopName, setShopName] = useState("");
  const [shopDishId, setShopDishId] = useState(dishes[0].id);
  const [shopPrice, setShopPrice] = useState("");
  const [shopMessage, setShopMessage] = useState<MessageKey | "">("");
  const { t, locale, dish: dishLabel, category } = useI18n();
  const accepted = history.filter((entry) => entry.status === "accepted");
  const favorites = tasteProfile.favorites.flatMap((id) => {
    const dish = dishesById.get(id);
    return dish ? [dish] : [];
  });
  const categoryRanking = Object.entries(tasteProfile.categoryWeights).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCategoryWeight = Math.max(1, ...categoryRanking.map(([, count]) => count));

  const confirmClearHistory = () => {
    if (window.confirm(t("tasteConfirmClear"))) clearHistory();
  };

  const confirmReset = () => {
    if (window.confirm(t("tasteConfirmReset"))) resetPreferences();
  };

  const submitShop = (event: FormEvent) => {
    event.preventDefault();
    const name = shopName.trim();
    const price = Number(shopPrice);
    const dish = dishesById.get(shopDishId);
    if (name.length < 2 || name.length > 40) {
      setShopMessage("tasteShopNameError");
      return;
    }
    if (!dish || !Number.isFinite(price) || price < 1 || price > 1000) {
      setShopMessage("tasteShopPriceError");
      return;
    }
    addFrequentShop({ name, dishId: dish.id, dishName: dish.name, approximatePrice: price });
    setShopName("");
    setShopPrice("");
    setShopMessage("tasteShopSaved");
  };

  if (!hasHydrated) return <PageLoading />;

  return (
    <div className="page-container py-8 sm:py-14">
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="numeric-type text-xs font-black uppercase tracking-[0.2em] text-tomato-600">Local taste profile</p><h1 className="display-type mt-2 text-4xl font-black sm:text-5xl">{t("tasteTitle")}</h1><p className="mt-3 max-w-2xl text-ink-500">{t("tasteIntro")}</p></div>
        <Link href="/choose/preferences" className="primary-button shrink-0"><Utensils size={18} aria-hidden="true" />{t("tasteStart")}</Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-sm font-black text-tomato-600">{t("tasteOverview")}</p><h2 className="mt-1 text-2xl font-black">{t("tasteOverviewTitle")}</h2></div><BarChart3 className="text-ink-500" aria-hidden="true" /></div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/5 p-4"><p className="text-xs font-bold text-ink-500">{t("tasteRecentBudget")}</p><p className="mt-1 font-black">{budgetLabel(tasteProfile.commonBudget === "any" ? preferences.budget : tasteProfile.commonBudget, locale)}</p></div>
              <div className="rounded-2xl bg-black/5 p-4"><p className="text-xs font-bold text-ink-500">{t("tasteRecentSpice")}</p><p className="mt-1 font-black">{spicePreferenceLabels[locale][tasteProfile.preferredSpice === "any" ? preferences.spice : tasteProfile.preferredSpice]}</p></div>
            </div>
            {categoryRanking.length > 0 ? (
              <div className="mt-6 space-y-3">
                {categoryRanking.map(([name, count]) => (
                  <div key={name}><div className="mb-1.5 flex justify-between text-sm font-bold"><span>{category(name)}</span><span className="numeric-type text-ink-500">{t("tasteTimes", { count })}</span></div><div className="h-2 overflow-hidden rounded-full bg-black/8"><div className="h-full rounded-full bg-cucumber-500" style={{ width: `${Math.max(16, (count / maxCategoryWeight) * 100)}%` }} /></div></div>
                ))}
              </div>
            ) : <p className="mt-6 rounded-2xl border border-dashed border-black/15 p-5 text-sm leading-6 text-ink-500">{t("tasteRankingEmpty")}</p>}
          </section>

          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-center gap-3"><ShieldCheck className="text-cucumber-500" aria-hidden="true" /><div><h2 className="font-black">{t("tasteLocalTitle")}</h2><p className="mt-1 text-sm leading-6 text-ink-500">{t("tasteLocalBody")}</p></div></div>
            <div className="mt-5 flex flex-col gap-2">
              <button type="button" onClick={confirmClearHistory} className="secondary-button justify-start"><Trash2 size={17} aria-hidden="true" />{t("tasteClearHistory")}</button>
              <button type="button" onClick={confirmReset} className="quiet-button justify-start"><RotateCcw size={17} aria-hidden="true" />{t("tasteReset")}</button>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-sm font-black text-tomato-600">{t("tasteShops")}</p><h2 className="mt-1 text-2xl font-black">{t("tasteShopsTitle")}</h2></div><Store className="text-ink-500" aria-hidden="true" /></div>
            <p className="mt-2 text-sm leading-6 text-ink-500">{t("tasteShopsIntro")}</p>
            <form onSubmit={submitShop} className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold">{t("tasteShopName")}<input value={shopName} onChange={(event) => setShopName(event.target.value)} maxLength={40} placeholder={t("tasteShopNamePlaceholder")} className="mt-2 w-full rounded-2xl border border-black/12 bg-white/70 px-4 py-3 outline-none focus:border-cucumber-500" /></label>
              <label className="text-sm font-bold">{t("tasteShopDish")}<select value={shopDishId} onChange={(event) => setShopDishId(event.target.value)} className="mt-2 w-full rounded-2xl border border-black/12 bg-white/70 px-4 py-3 outline-none focus:border-cucumber-500">{dishes.map((dish) => <option key={dish.id} value={dish.id}>{dishLabel(dish.name)}</option>)}</select></label>
              <label className="text-sm font-bold">{t("tasteShopPrice")}<input value={shopPrice} onChange={(event) => setShopPrice(event.target.value)} inputMode="decimal" type="number" min="1" max="1000" placeholder={t("tasteShopPricePlaceholder")} className="mt-2 w-full rounded-2xl border border-black/12 bg-white/70 px-4 py-3 outline-none focus:border-cucumber-500" /></label>
              <button type="submit" className="primary-button self-end py-3"><Plus size={18} aria-hidden="true" />{t("tasteShopSave")}</button>
            </form>
            <p aria-live="polite" className="mt-3 min-h-5 text-sm font-bold text-cucumber-500">{shopMessage ? t(shopMessage) : ""}</p>
            {frequentShops.length > 0 ? (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {frequentShops.map((shop) => <li key={shop.id} className="flex items-start justify-between gap-3 rounded-2xl border border-black/10 bg-white/45 p-4"><div className="min-w-0"><p className="truncate font-black">{shop.name}</p><p className="mt-1 text-sm text-ink-500">{t("tasteShopLine", { dish: dishLabel(dishesById.get(shop.dishId)?.name ?? shop.dishName), price: shop.approximatePrice })}</p></div><button type="button" onClick={() => removeFrequentShop(shop.id)} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-black/5" aria-label={t("tasteShopDelete", { name: shop.name })}><X size={17} aria-hidden="true" /></button></li>)}
              </ul>
            ) : <p className="mt-3 rounded-2xl border border-dashed border-black/15 p-5 text-sm leading-6 text-ink-500">{t("tasteShopsEmpty")}</p>}
          </section>

          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-sm font-black text-tomato-600">{t("tasteRecent")}</p><h2 className="mt-1 text-2xl font-black">{t("tasteHistory")}</h2></div><History className="text-ink-500" aria-hidden="true" /></div>
            {accepted.length > 0 ? (
              <ol className="mt-5 divide-y divide-black/8">
                {accepted.slice(0, 12).map((entry) => {
                  const dish = dishesById.get(entry.dishId) ?? { id: entry.dishId, name: entry.dishName, category: entry.category };
                  return (
                    <li key={entry.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <DishImage dish={dish} variant="thumbnail" />
                      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-3"><p className="font-black">{dishLabel(dish.name)}</p><time className="numeric-type text-xs font-bold text-ink-500">{dateFormatters[locale].format(new Date(entry.selectedAt))}</time></div><p className="mt-1 truncate text-sm text-ink-500">{category(dish.category)}</p></div>
                    </li>
                  );
                })}
              </ol>
            ) : <div className="mt-6 rounded-2xl border border-dashed border-black/15 p-8 text-center"><Clock3 className="mx-auto text-ink-500" aria-hidden="true" /><p className="mt-3 font-black">{t("tasteHistoryEmptyTitle")}</p><p className="mt-1 text-sm text-ink-500">{t("tasteHistoryEmptyBody")}</p></div>}
          </section>

          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-sm font-black text-tomato-600">{t("tasteFavorites")}</p><h2 className="mt-1 text-2xl font-black">{t("tasteFavoritesTitle")}</h2></div><Bookmark className="text-ink-500" aria-hidden="true" /></div>
            {favorites.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {favorites.map((dish) => <article key={dish.id} className="group overflow-hidden rounded-[22px] border border-black/10 bg-white/50"><DishImage dish={dish} variant="compact" /><div className="p-4"><p className="font-black">{dishLabel(dish.name)}</p><p className="mt-1 text-xs font-bold text-ink-500">{category(dish.category)} · ¥{dish.priceRange[0]}–{dish.priceRange[1]}</p></div></article>)}
              </div>
            ) : <p className="mt-5 rounded-2xl border border-dashed border-black/15 p-5 text-sm leading-6 text-ink-500">{t("tasteFavoritesEmpty")}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
