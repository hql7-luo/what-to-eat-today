import { beforeEach, describe, expect, it, vi } from "vitest";

import { dishes } from "@/data/dishes";
import {
  CORRUPT_STORAGE_PREFIX,
  PERSIST_VERSION,
  STORE_KEY,
} from "@/features/store/persistence";
import { recommendDishes } from "@/lib/recommendation";
import { DEFAULT_PREFERENCES } from "@/types";

async function freshStore() {
  vi.resetModules();
  const storeModule = await import("@/features/store/use-app-store");
  await vi.waitFor(() => expect(storeModule.useAppStore.getState().hasHydrated).toBe(true));
  return storeModule.useAppStore;
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("真实 Zustand 持久化链路", () => {
  it("损坏 JSON 会被隔离、恢复默认状态并完成 hydration", async () => {
    localStorage.setItem(STORE_KEY, "{not-valid-json");

    const store = await freshStore();
    const state = store.getState();

    expect(state.hasHydrated).toBe(true);
    expect(state.preferences).toEqual(DEFAULT_PREFERENCES);
    expect(state.history).toEqual([]);
    expect(state.frequentShops).toEqual([]);
    expect(localStorage.getItem(STORE_KEY)).not.toContain("not-valid-json");
    expect(Object.keys(localStorage).some((key) => key.startsWith(CORRUPT_STORAGE_PREFIX))).toBe(true);
  });

  it("字段损坏的数据不会进入 Store，也不会永久 Loading", async () => {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      version: PERSIST_VERSION,
      state: {
        preferences: { ...DEFAULT_PREFERENCES, maxWait: 9_999 },
        candidates: [],
        acceptedResultIds: [],
        sessionExcludedDishIds: [],
        sessionDislikedDishIds: [],
        history: [{ selectedAt: "not-a-date" }],
        tasteProfile: { favorites: [], categoryWeights: {}, commonBudget: "any", preferredSpice: "any" },
        frequentShops: [],
        soundEnabled: true,
      },
    }));

    const store = await freshStore();
    expect(store.getState().hasHydrated).toBe(true);
    expect(store.getState().preferences).toEqual(DEFAULT_PREFERENCES);
    expect(store.getState().history).toEqual([]);
    expect(Object.keys(localStorage).some((key) => key.startsWith(CORRUPT_STORAGE_PREFIX))).toBe(true);
  });

  it("将含餐厅和位置字段的 v2 数据迁移到纯菜品版本并保留有效偏好与历史", async () => {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      version: 2,
      state: {
        location: { label: "旧地址", source: "manual", address: "上海环球港" },
        preferences: { ...DEFAULT_PREFERENCES, budget: "20to30", spice: "mild" },
        candidates: [{ restaurant: { name: "旧餐厅" } }],
        acceptedResultIds: [],
        sessionExcludedDishIds: ["dish-001"],
        sessionDislikedDishIds: [],
        history: [{ id: "old-entry", dishId: "dish-002", dishName: "土豆牛腩饭", category: "中式快餐", restaurantName: "旧餐厅", selectedAt: "2026-07-18T12:00:00.000Z", status: "accepted" }],
        tasteProfile: { favorites: ["dish-002"], categoryWeights: { 轻食: 2 }, commonBudget: "20to30", preferredSpice: "mild" },
        soundEnabled: false,
        isDemoMode: true,
      },
    }));

    const store = await freshStore();
    expect(store.getState()).toMatchObject({
      hasHydrated: true,
      preferences: { budget: "20to30", spice: "mild" },
      candidates: [],
      sessionExcludedDishIds: ["dish-001"],
      frequentShops: [],
      soundEnabled: false,
    });
    expect(store.getState().history[0]).not.toHaveProperty("restaurantName");
    expect(store.getState()).not.toHaveProperty("location");
    const persisted = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}") as { version?: number };
    expect(persisted.version).toBe(PERSIST_VERSION);
  });

  it("常点店铺经过真实持久化后仍能恢复", async () => {
    const store = await freshStore();
    const dish = dishes[0];
    store.getState().addFrequentShop({ name: "楼下张记", dishId: dish.id, dishName: dish.name, approximatePrice: 26 });
    expect(store.getState().frequentShops).toHaveLength(1);

    const rehydratedStore = await freshStore();
    expect(rehydratedStore.getState().frequentShops[0]).toMatchObject({ name: "楼下张记", dishId: dish.id, approximatePrice: 26 });
  });

  it("同一抽取结果重复点击和刷新后再次确认都只写入一次", async () => {
    const candidate = recommendDishes({
      dishes,
      preferences: DEFAULT_PREFERENCES,
      random: () => 0,
      limit: 1,
    })[0];
    const store = await freshStore();

    store.getState().setSelectedCandidate(candidate);
    const resultId = store.getState().selectedResultId;
    expect(resultId).toBeTruthy();
    store.getState().acceptCurrentResult();
    store.getState().acceptCurrentResult();

    expect(store.getState().history).toHaveLength(1);
    expect(store.getState().acceptedResultIds).toEqual([resultId]);
    expect(store.getState().tasteProfile.categoryWeights[candidate.dish.category]).toBe(1);

    const rehydratedStore = await freshStore();
    expect(rehydratedStore.getState().selectedResultId).toBe(resultId);
    expect(rehydratedStore.getState().acceptedResultIds).toEqual([resultId]);
    rehydratedStore.getState().acceptCurrentResult();
    expect(rehydratedStore.getState().history).toHaveLength(1);
    expect(rehydratedStore.getState().tasteProfile.categoryWeights[candidate.dish.category]).toBe(1);
  });
});
