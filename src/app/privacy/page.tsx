"use client";

import { Database, MapPinOff, Search, ShieldCheck, Store, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

import { PageLoading } from "@/components/page-loading";
import { useAppStore } from "@/features/store/use-app-store";

export default function PrivacyPage() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const soundEnabled = useAppStore((state) => state.soundEnabled);
  const toggleSound = useAppStore((state) => state.toggleSound);

  if (!hasHydrated) return <PageLoading />;

  return (
    <div className="page-container py-8 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <p className="numeric-type text-xs font-black uppercase tracking-[0.2em] text-tomato-600">Settings & privacy</p>
        <h1 className="display-type mt-2 text-4xl font-black sm:text-5xl">设置与隐私</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink-500">不读取位置，不连接地图或外卖平台；所有个性化数据都留在当前浏览器。</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black text-tomato-600">抽取音效</p><h2 className="mt-1 text-xl font-black">停止时轻响一下</h2></div><span className="grid size-11 place-items-center rounded-2xl bg-yolk-400/25">{soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}</span></div>
            <p className="mt-3 text-sm leading-6 text-ink-500">震动由设备能力决定；开启“减少动态效果”后，滚动时长会自动缩短。</p>
            <button type="button" onClick={toggleSound} aria-pressed={soundEnabled} className={`mt-5 w-full ${soundEnabled ? "secondary-button" : "primary-button"}`}>{soundEnabled ? "关闭音效" : "开启音效"}</button>
          </section>

          <section className="ticket-card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black text-tomato-600">数据来源</p><h2 className="mt-1 text-xl font-black">纯本地菜品模式</h2></div><Database className="text-cucumber-500" aria-hidden="true" /></div>
            <p className="mt-4 text-sm leading-6 text-ink-500">候选来自项目自带的 92 道菜品资料。常见价格和准备时间用于筛选参考，不代表任何具体店铺的实时数据。</p>
          </section>
        </div>

        <section className="ticket-card mt-5 overflow-hidden">
          <div className="border-b border-black/8 p-6 sm:p-7"><h2 className="text-2xl font-black">数据边界</h2><p className="mt-2 text-sm leading-6 text-ink-500">这个工具只帮助决定吃什么，不推荐附近店铺，也不提供下单服务。</p></div>
          <div className="divide-y divide-black/8">
            {[
              [MapPinOff, "不读取位置", "项目没有浏览器定位、地址输入、地图 API 或附近餐厅搜索。"],
              [ShieldCheck, "保存在本机", "历史、收藏、口味偏好和常点店铺保存在浏览器 localStorage。"],
              [Store, "店铺由你手动维护", "常点店铺只用于抽中匹配菜品时提醒，不参与推荐权重。"],
              [Search, "没有美团数据接入", "复制按钮只复制菜名，由用户自行打开美团搜索；本站不读取菜单、价格或订单。"],
            ].map(([Icon, title, description]) => (
              <div key={String(title)} className="flex gap-4 p-6 sm:p-7"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-black/5"><Icon size={20} aria-hidden="true" /></span><div><h3 className="font-black">{String(title)}</h3><p className="mt-1 text-sm leading-6 text-ink-500">{String(description)}</p></div></div>
            ))}
          </div>
        </section>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/taste" className="primary-button">查看我的口味</Link>
          <Link href="/choose/preferences" className="secondary-button">开始今天的选择</Link>
        </div>
      </div>
    </div>
  );
}
