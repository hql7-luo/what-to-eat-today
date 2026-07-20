import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-container grid min-h-[70svh] place-items-center py-16 text-center">
      <div><p className="numeric-type text-7xl font-black text-yolk-400">404</p><h1 className="display-type mt-3 text-4xl font-black">这份食签不在菜单上</h1><p className="mt-3 text-ink-500">返回首页，重新决定今天吃什么。</p><Link href="/" className="primary-button mt-7">返回首页</Link></div>
    </div>
  );
}
