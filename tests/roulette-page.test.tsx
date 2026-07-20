import { act, type HTMLAttributes, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const browserMocks = vi.hoisted(() => ({
  push: vi.fn(),
  controls: { set: vi.fn(), start: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: browserMocks.push }),
}));

vi.mock("motion/react", async () => {
  const { forwardRef: createForwardRef } = await import("react");
  type MockProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode; animate?: unknown };
  return {
    motion: {
      div: createForwardRef<HTMLDivElement, MockProps>(
        function MockMotionDiv({ children, animate, ...props }, ref) {
          void animate;
          return <div ref={ref} {...props}>{children}</div>;
        },
      ),
    },
    useAnimationControls: () => browserMocks.controls,
    useReducedMotion: () => true,
  };
});

import RoulettePage from "@/app/roulette/page";
import { dishes } from "@/data/dishes";
import { useAppStore } from "@/features/store/use-app-store";
import { recommendDishes } from "@/lib/recommendation";
import { DEFAULT_PREFERENCES } from "@/types";

const candidates = recommendDishes({
  dishes,
  preferences: DEFAULT_PREFERENCES,
  random: () => 0.4,
  limit: 10,
});

let root: Root | undefined;
let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  useAppStore.setState({ hasHydrated: false, candidates: [], sessionExcludedDishIds: [] });
});

afterEach(() => {
  if (root) act(() => root?.unmount());
  root = undefined;
  container.remove();
  vi.clearAllMocks();
});

describe("RoulettePage hydration", () => {
  it("hydration 完成并恢复候选后重建 50 张轨道卡片", async () => {
    root = createRoot(container);
    await act(async () => root?.render(<RoulettePage />));
    expect(container.querySelectorAll("article")).toHaveLength(0);

    await act(async () => {
      useAppStore.setState({ hasHydrated: true, candidates });
    });

    expect(container.querySelectorAll("article")).toHaveLength(50);
    expect(container.textContent).toContain("候选已装入，准备开始抽取");
  });
});
