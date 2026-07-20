import { LoaderCircle } from "lucide-react";

export function PageLoading({ label = "正在恢复本地选择…" }: { label?: string }) {
  return (
    <div className="page-container grid min-h-[65svh] place-items-center py-16" role="status" aria-live="polite">
      <div className="text-center"><LoaderCircle className="mx-auto animate-spin text-tomato-500" aria-hidden="true" /><p className="mt-3 text-sm font-bold text-ink-500">{label}</p></div>
    </div>
  );
}
