import { describe, expect, it } from "vitest";

import { dishes } from "@/data/dishes";
import { recommendDishes, selectWeightedCandidate } from "@/lib/recommendation";
import type { HistoryEntry, Preferences } from "@/types";

const now = new Date("2026-07-20T12:00:00+08:00");
const basePreferences: Preferences = {
  budget: "any",
  spice: "any",
  goal: "normal",
  partySize: "1",
  maxWait: null,
};

function historyEntry(dishId: string, selectedAt: string, status: HistoryEntry["status"] = "accepted"): HistoryEntry {
  return {
    id: `${dishId}-${selectedAt}`,
    dishId,
    dishName: "测试菜品",
    category: "测试",
    selectedAt,
    status,
  };
}

describe("recommendDishes", () => {
  it("完全排除昨天吃过的菜品", () => {
    const dish = dishes[0];
    const result = recommendDishes({
      dishes: [dish],
      preferences: basePreferences,
      history: [historyEntry(dish.id, "2026-07-19T12:00:00+08:00")],
      now,
    });
    expect(result).toHaveLength(0);
  });

  it("显著降低 2–3 天前吃过菜品的权重", () => {
    const dish = dishes[0];
    const input = { dishes: [dish], preferences: basePreferences, now, random: () => 0 };
    const fresh = recommendDishes(input)[0];
    const recent = recommendDishes({
      ...input,
      history: [historyEntry(dish.id, "2026-07-18T12:00:00+08:00")],
    })[0];
    expect(recent.score).toBeLessThan(fresh.score * 0.5);
    expect(recent.reasons.some((reason) => reason.includes("2–3 天前"))).toBe(true);
  });

  it("预算不匹配时排除或显著降权", () => {
    const affordable = dishes.find((dish) => dish.priceRange[0] <= 20)!;
    const expensive = dishes.find((dish) => dish.priceRange[0] >= 38)!;
    const result = recommendDishes({
      dishes: [affordable, expensive],
      preferences: { ...basePreferences, budget: "under20" },
      random: () => 0,
      limit: 10,
    });
    const affordableResult = result.find((candidate) => candidate.dishId === affordable.id);
    const expensiveResult = result.find((candidate) => candidate.dishId === expensive.id);
    expect(affordableResult).toBeDefined();
    expect(expensiveResult === undefined || expensiveResult.score < affordableResult!.score * 0.65).toBe(true);
  });

  it("不吃辣时不会推荐辣味菜品", () => {
    const spicy = dishes.find((dish) => dish.spiceLevel === 3)!;
    const result = recommendDishes({
      dishes: [spicy],
      preferences: { ...basePreferences, spice: "none" },
    });
    expect(result).toHaveLength(0);
  });

  it("减脂和增肌目标分别优先匹配对应标签", () => {
    const fit = dishes.find((dish) => dish.fatLossFriendly)!;
    const protein = dishes.find((dish) => dish.muscleGainFriendly && !dish.fatLossFriendly)!;
    const regular = dishes.find((dish) => !dish.fatLossFriendly && !dish.muscleGainFriendly && dish.spiceLevel === 0)!;
    const fatLossResult = recommendDishes({ dishes: [fit, regular], preferences: { ...basePreferences, goal: "fat-loss" }, random: () => 0, limit: 1 });
    const muscleResult = recommendDishes({ dishes: [protein, regular], preferences: { ...basePreferences, goal: "muscle-gain" }, random: () => 0, limit: 1 });
    expect(fatLossResult[0].dish.fatLossFriendly).toBe(true);
    expect(muscleResult[0].dish.muscleGainFriendly).toBe(true);
  });

  it("本轮抽过与明确不喜欢的菜品不会再次出现", () => {
    const [drawn, disliked, available] = dishes.slice(0, 3);
    const result = recommendDishes({
      dishes: [drawn, disliked, available],
      preferences: basePreferences,
      excludedDishIds: [drawn.id],
      dislikedDishIds: [disliked.id],
    });
    expect(result.map((candidate) => candidate.dishId)).toEqual([available.id]);
  });

  it("候选不足时放宽饮食目标和时间，但保留辣度与人数硬约束", () => {
    const regular = dishes.find((dish) => !dish.fatLossFriendly && dish.spiceLevel === 0 && dish.suitableParties.includes("1"))!;
    const result = recommendDishes({
      dishes: [regular],
      preferences: { ...basePreferences, goal: "fat-loss", maxWait: 20 },
      limit: 10,
    });
    expect(result).toHaveLength(1);
    expect(result[0].relaxedConstraints).toContain("goal");
  });

  it("候选池菜品唯一、分类多样，普通选择最多出现一份饮品", () => {
    const result = recommendDishes({
      dishes,
      preferences: basePreferences,
      limit: 10,
      random: () => 0,
    });
    expect(result).toHaveLength(10);
    expect(new Set(result.map((candidate) => candidate.dishId)).size).toBe(10);
    expect(result.filter((candidate) => ["咖啡", "奶茶"].includes(candidate.dish.category)).length).toBeLessThanOrEqual(1);
  });

  it("只使用本地菜品字段生成候选，不包含餐厅或位置数据", () => {
    const result = recommendDishes({ dishes: dishes.slice(0, 4), preferences: basePreferences, random: () => 0 });
    expect(result.length).toBeGreaterThan(0);
    expect(Object.keys(result[0])).toEqual(expect.arrayContaining(["id", "dishId", "dish", "score", "reasons", "relaxedConstraints"]));
    expect(result[0]).not.toHaveProperty("restaurant");
    expect(result[0]).not.toHaveProperty("restaurantId");
  });
});

describe("selectWeightedCandidate", () => {
  it("总是从当前候选池中按分数权重选择结果", () => {
    const candidates = recommendDishes({ dishes: dishes.slice(0, 8), preferences: basePreferences, random: () => 0 });
    expect(selectWeightedCandidate(candidates, () => 0)?.id).toBe(candidates[0].id);
    expect(candidates).toContainEqual(selectWeightedCandidate(candidates, () => 0.999));
  });
});
