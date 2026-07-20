import { act, type HTMLAttributes, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("motion/react", async () => {
  const { forwardRef: createForwardRef } = await import("react");
  type MockProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode };
  return {
    motion: {
      div: createForwardRef<HTMLDivElement, MockProps>(
        function MockMotionDiv({ children, ...props }, ref) {
          return <div ref={ref} {...props}>{children}</div>;
        },
      ),
      section: createForwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
        function MockMotionSection({ children, ...props }, ref) {
          return <section ref={ref} {...props}>{children}</section>;
        },
      ),
    },
  };
});

import ResultPage from "@/app/result/page";
import { dishes } from "@/data/dishes";
import { useAppStore } from "@/features/store/use-app-store";
import { recommendDishes } from "@/lib/recommendation";
import { DEFAULT_PREFERENCES } from "@/types";

const candidate = recommendDishes({ dishes, preferences: DEFAULT_PREFERENCES, random: () => 0, limit: 1 })[0];
let root: Root | undefined;
let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  useAppStore.setState({
    hasHydrated: true,
    selectedCandidate: candidate,
    selectedResultId: "result-test",
    acceptedResultIds: [],
    frequentShops: [{
      id: "shop-test",
      name: "楼下测试店",
      dishId: candidate.dishId,
      dishName: candidate.dish.name,
      approximatePrice: 26,
      createdAt: "2026-07-20T12:00:00.000Z",
    }],
  });
});

afterEach(() => {
  if (root) act(() => root?.unmount());
  root = undefined;
  container.remove();
  vi.clearAllMocks();
});

describe("ResultPage", () => {
  it("优先显示与抽中菜品匹配的本地常点店铺", async () => {
    root = createRoot(container);
    await act(async () => root?.render(<ResultPage />));

    expect(container.textContent).toContain("你常点的店");
    expect(container.textContent).toContain("楼下测试店");
    expect(container.textContent).toContain(`常点 ${candidate.dish.name} · 约 ¥26`);
  });

  it("只展示菜品参考信息，不渲染距离、评分、营业状态或高德入口", async () => {
    root = createRoot(container);
    await act(async () => root?.render(<ResultPage />));

    expect(container.textContent).toContain(`常见 ¥${candidate.dish.priceRange[0]}–${candidate.dish.priceRange[1]}`);
    expect(container.textContent).toContain("复制菜名");
    expect(container.textContent).not.toMatch(/距离|评分|营业状态|高德/);
  });
});
