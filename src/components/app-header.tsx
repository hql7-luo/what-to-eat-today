import { Settings2, Utensils } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="relative z-40 border-b border-black/8 bg-rice-50/85 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between sm:h-[72px]">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 rounded-xl pr-2" aria-label="今天吃什么首页">
          <span className="grid size-9 rotate-[-4deg] place-items-center rounded-[12px] bg-tomato-500 text-white shadow-[0_3px_0_#a52e22]">
            <Utensils size={19} strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="display-type text-[20px] font-black sm:text-[22px]">今天吃什么</span>
        </Link>
        <nav aria-label="主要导航" className="flex items-center gap-1">
          <Link href="/taste" className="quiet-button px-3 text-sm">
            我的口味
          </Link>
          <Link href="/privacy" className="grid size-11 place-items-center rounded-full text-ink-700 hover:bg-black/5" aria-label="设置与隐私">
            <Settings2 size={19} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
