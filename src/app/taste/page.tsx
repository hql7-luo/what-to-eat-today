"use client";

import { BarChart3, Bookmark, Clock3, History, Plus, RotateCcw, ShieldCheck, Store, Trash2, Utensils, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { DishImage } from "@/components/dish-image";
import { PageLoading } from "@/components/page-loading";
import { dishes, dishesById } from "@/data/dishes";
import { useAppStore } from "@/features/store/use-app-store";
import { budgetLabel } from "@/lib/recommendation";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

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
  const [shopMessage, setShopMessage] = useState("");
  const accepted = history.filter((entry) => entry.status === "accepted");
  const favorites = tasteProfile.favorites.flatMap((id) => {
    const dish = dishesById.get(id);
    return dish ? [dish] : [];
  });
  const categoryRanking = Object.entries(tasteProfile.categoryWeights).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCategoryWeight = Math.max(1, ...categoryRanking.map(([, count]) => count));

  const confirmClearHistory = () => {
    if (window.confirm("确定清除全部用餐历史吗？收藏、常点店铺和口味偏好会保留。")) clearHistory();
  };

  const confirmReset = () => {
    if (window.confirm("确定重置口味偏好吗？收藏和分类偏好将被清空，常点店铺会保留。")) resetPreferences();
  };

  const submitShop = (event: FormEvent) => {
    event.preventDefault();
    const name = shopName.trim();
    const price = Number(shopPrice);
    const dish = dishesById.get(shopDishId);
    if (name.length < 2 || name.length > 40) {
      setShopMessage("店铺名称请输入 2–40 个字符。");
      return;
    }
    if (!dish || !Number.isFinite(price) || price < 1 || price > 1000) {
      setShopMessage("请选择菜品，并填写 1–1000 元的大致价格。");
      return;
    }
    addFrequentShop({ name, dishId: dish.id, dishName: dish.name, approximatePrice: price });
    setShopName("");
    setShopPrice("");
    setShopMessage("已保存到当前浏览器。抽到这道菜时会优先显示这家店。");
  };

  if (!hasHydrated) return <PageLoading />;

  return (
    <div className="page-container py-8 sm:py-14">
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="numeric-type text-xs font-black uppercase tracking-[0.2em] text-tomato-600">Local taste profile</p><h1 className="display-type mt-2 text-4xl font-black sm:text-5xl">我的口味</h1><p className="mt-3 max-w-2xl text-ink-500">这里只记你在这台浏览器上的选择，用来少吃重复、让下一次推荐更懂你。</p></div>
        <Link href="/choose/preferences" className="primary-button shrink-0"><Utensils size={18} aria-hidden="true" />开始今天的选择</Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-sm font-black text-tomato-600">偏好概览</p><h2 className="mt-1 text-2xl font-black">你常点什么</h2></div><BarChart3 className="text-ink-500" aria-hidden="true" /></div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/5 p-4"><p className="text-xs font-bold text-ink-500">最近预算</p><p className="mt-1 font-black">{budgetLabel(tasteProfile.commonBudget === "any" ? preferences.budget : tasteProfile.commonBudget)}</p></div>
              <div className="rounded-2xl bg-black/5 p-4"><p className="text-xs font-bold text-ink-500">最近辣度</p><p className="mt-1 font-black">{{ none: "不吃辣", mild: "微辣", medium: "中辣", hot: "重辣", any: "都可以" }[tasteProfile.preferredSpice === "any" ? preferences.spice : tasteProfile.preferredSpice]}</p></div>
            </div>
            {categoryRanking.length > 0 ? (
              <div className="mt-6 space-y-3">
                {categoryRanking.map(([category, count]) => (
                  <div key={category}><div className="mb-1.5 flex justify-between text-sm font-bold"><span>{category}</span><span className="numeric-type text-ink-500">{count} 次</span></div><div className="h-2 overflow-hidden rounded-full bg-black/8"><div className="h-full rounded-full bg-cucumber-500" style={{ width: `${Math.max(16, (count / maxCategoryWeight) * 100)}%` }} /></div></div>
                ))}
              </div>
            ) : <p className="mt-6 rounded-2xl border border-dashed border-black/15 p-5 text-sm leading-6 text-ink-500">点击一次“就吃这个”后，这里会开始形成你的常选分类。</p>}
          </section>

          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-center gap-3"><ShieldCheck className="text-cucumber-500" aria-hidden="true" /><div><h2 className="font-black">只保存在当前浏览器</h2><p className="mt-1 text-sm leading-6 text-ink-500">清除浏览器数据后可能丢失，不会自动同步到其他设备。</p></div></div>
            <div className="mt-5 flex flex-col gap-2">
              <button type="button" onClick={confirmClearHistory} className="secondary-button justify-start"><Trash2 size={17} aria-hidden="true" />清除历史记录</button>
              <button type="button" onClick={confirmReset} className="quiet-button justify-start"><RotateCcw size={17} aria-hidden="true" />重置收藏与偏好</button>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-sm font-black text-tomato-600">我的常点店铺</p><h2 className="mt-1 text-2xl font-black">抽中时优先提醒</h2></div><Store className="text-ink-500" aria-hidden="true" /></div>
            <p className="mt-2 text-sm leading-6 text-ink-500">手动保存店名、常点菜品和大致价格。数据仅存于当前浏览器，不参与推荐权重。</p>
            <form onSubmit={submitShop} className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold">店铺名称<input value={shopName} onChange={(event) => setShopName(event.target.value)} maxLength={40} placeholder="例如：楼下张记" className="mt-2 w-full rounded-2xl border border-black/12 bg-white/70 px-4 py-3 outline-none focus:border-cucumber-500" /></label>
              <label className="text-sm font-bold">常点菜品<select value={shopDishId} onChange={(event) => setShopDishId(event.target.value)} className="mt-2 w-full rounded-2xl border border-black/12 bg-white/70 px-4 py-3 outline-none focus:border-cucumber-500">{dishes.map((dish) => <option key={dish.id} value={dish.id}>{dish.name}</option>)}</select></label>
              <label className="text-sm font-bold">大致价格（元）<input value={shopPrice} onChange={(event) => setShopPrice(event.target.value)} inputMode="decimal" type="number" min="1" max="1000" placeholder="例如：28" className="mt-2 w-full rounded-2xl border border-black/12 bg-white/70 px-4 py-3 outline-none focus:border-cucumber-500" /></label>
              <button type="submit" className="primary-button self-end py-3"><Plus size={18} aria-hidden="true" />保存常点店铺</button>
            </form>
            <p aria-live="polite" className="mt-3 min-h-5 text-sm font-bold text-cucumber-500">{shopMessage}</p>
            {frequentShops.length > 0 ? (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {frequentShops.map((shop) => <li key={shop.id} className="flex items-start justify-between gap-3 rounded-2xl border border-black/10 bg-white/45 p-4"><div className="min-w-0"><p className="truncate font-black">{shop.name}</p><p className="mt-1 text-sm text-ink-500">{shop.dishName} · 约 ¥{shop.approximatePrice}</p></div><button type="button" onClick={() => removeFrequentShop(shop.id)} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-black/5" aria-label={`删除 ${shop.name}`}><X size={17} aria-hidden="true" /></button></li>)}
              </ul>
            ) : <p className="mt-3 rounded-2xl border border-dashed border-black/15 p-5 text-sm leading-6 text-ink-500">还没有常点店铺。添加后，抽到匹配菜品时会在结果页优先显示。</p>}
          </section>

          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-sm font-black text-tomato-600">最近吃过</p><h2 className="mt-1 text-2xl font-black">用餐历史</h2></div><History className="text-ink-500" aria-hidden="true" /></div>
            {accepted.length > 0 ? (
              <ol className="mt-5 divide-y divide-black/8">
                {accepted.slice(0, 12).map((entry) => {
                  const dish = dishesById.get(entry.dishId) ?? { id: entry.dishId, name: entry.dishName, category: entry.category };
                  return (
                    <li key={entry.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <DishImage dish={dish} variant="thumbnail" />
                      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-3"><p className="font-black">{entry.dishName}</p><time className="numeric-type text-xs font-bold text-ink-500">{dateFormatter.format(new Date(entry.selectedAt))}</time></div><p className="mt-1 truncate text-sm text-ink-500">{entry.category}</p></div>
                    </li>
                  );
                })}
              </ol>
            ) : <div className="mt-6 rounded-2xl border border-dashed border-black/15 p-8 text-center"><Clock3 className="mx-auto text-ink-500" aria-hidden="true" /><p className="mt-3 font-black">还没有确认过餐食</p><p className="mt-1 text-sm text-ink-500">抽到满意结果后点击“就吃这个”。</p></div>}
          </section>

          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-sm font-black text-tomato-600">收藏</p><h2 className="mt-1 text-2xl font-black">留到下次想</h2></div><Bookmark className="text-ink-500" aria-hidden="true" /></div>
            {favorites.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {favorites.map((dish) => <article key={dish.id} className="group overflow-hidden rounded-[22px] border border-black/10 bg-white/50"><DishImage dish={dish} variant="compact" /><div className="p-4"><p className="font-black">{dish.name}</p><p className="mt-1 text-xs font-bold text-ink-500">{dish.category} · ¥{dish.priceRange[0]}–{dish.priceRange[1]}</p></div></article>)}
              </div>
            ) : <p className="mt-5 rounded-2xl border border-dashed border-black/15 p-5 text-sm leading-6 text-ink-500">结果页点一下爱心，就能把菜品留在这里。</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
