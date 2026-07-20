import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { dishes } from "@/data/dishes";
import {
  CATEGORY_FOOD_IMAGE_ASSETS,
  DISH_FOOD_IMAGE_ASSETS,
  DISH_IMAGE_KEYS,
  FOOD_IMAGE_ASSETS,
  FOOD_IMAGE_FALLBACK,
  resolveFoodImage,
} from "@/lib/food-image";

describe("food image resolver", () => {
  it("为全部本地菜品解析到已登记的本地图片", () => {
    for (const dish of dishes) {
      const image = resolveFoodImage(dish);
      expect(FOOD_IMAGE_ASSETS[image.key]).toBeDefined();
      expect(image.src).toMatch(/^\/food\/(categories|dishes)\/[a-z-]+\.jpg$/);
      expect(existsSync(join(process.cwd(), "public", image.src.replace(/^\//, "")))).toBe(true);
    }
  });

  it("登记 35 张独立菜品图和 17 张分类兜底图", () => {
    expect(Object.keys(DISH_FOOD_IMAGE_ASSETS)).toHaveLength(35);
    expect(Object.keys(CATEGORY_FOOD_IMAGE_ASSETS)).toHaveLength(17);
    expect(Object.keys(FOOD_IMAGE_ASSETS)).toHaveLength(52);
  });

  it("50 道高频菜使用互不重复的明确映射", () => {
    const keys = Object.values(DISH_IMAGE_KEYS);

    expect(keys).toHaveLength(50);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("核心高频菜品优先使用对应的独立图", () => {
    expect(resolveFoodImage(dishes.find((dish) => dish.name === "番茄牛腩饭")!).key).toBe("tomato-beef-rice");
    expect(resolveFoodImage(dishes.find((dish) => dish.name === "番茄炒蛋饭")!).key).toBe("tomato-egg-rice");
    expect(resolveFoodImage(dishes.find((dish) => dish.name === "重庆小面")!).key).toBe("chongqing-noodles");
    expect(resolveFoodImage(dishes.find((dish) => dish.name === "螺蛳粉")!).key).toBe("luosifen");
    expect(resolveFoodImage(dishes.find((dish) => dish.name === "三文鱼寿司套餐")!).key).toBe("sushi");
    expect(resolveFoodImage(dishes.find((dish) => dish.name === "鳗鱼饭")!).key).toBe("eel-rice");
    expect(resolveFoodImage(dishes.find((dish) => dish.name === "冰美式")!).key).toBe("iced-americano");
    expect(resolveFoodImage(dishes.find((dish) => dish.name === "拿铁咖啡")!).key).toBe("latte");
  });

  it("热门饭、面和饮品组内部不再共图", () => {
    const groups = [dishes.slice(0, 8), dishes.slice(8, 16), dishes.slice(68, 76)];

    for (const group of groups) {
      const keys = group.map((dish) => resolveFoodImage(dish).key);
      expect(new Set(keys).size).toBe(group.length);
    }
  });

  it("未知分类使用统一的半真实图片兜底", () => {
    expect(resolveFoodImage({ id: "unknown", name: "未知菜品", category: "未知分类" }).key).toBe(FOOD_IMAGE_FALLBACK);
  });
});
