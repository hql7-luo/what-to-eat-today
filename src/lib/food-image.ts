import type { Dish } from "@/types";

import { prefixWithBasePath } from "@/lib/base-path";

type FoodImageAsset = {
  src: string;
  objectPosition: "center";
};

export const CATEGORY_FOOD_IMAGE_ASSETS = {
  "rice-bowl": { src: "/food/categories/chicken-rice-bowl.jpg", objectPosition: "center" },
  "tomato-beef-rice": { src: "/food/categories/tomato-beef-rice.jpg", objectPosition: "center" },
  noodles: { src: "/food/categories/noodles.jpg", objectPosition: "center" },
  "mala-bowl": { src: "/food/categories/mala-bowl.jpg", objectPosition: "center" },
  hotpot: { src: "/food/categories/hotpot.jpg", objectPosition: "center" },
  "grilled-platter": { src: "/food/categories/grilled-platter.jpg", objectPosition: "center" },
  burger: { src: "/food/categories/burger.jpg", objectPosition: "center" },
  "fried-chicken": { src: "/food/categories/fried-chicken.jpg", objectPosition: "center" },
  pizza: { src: "/food/categories/pizza.jpg", objectPosition: "center" },
  sushi: { src: "/food/categories/sushi.jpg", objectPosition: "center" },
  "salad-bowl": { src: "/food/categories/salad-bowl.jpg", objectPosition: "center" },
  porridge: { src: "/food/categories/porridge.jpg", objectPosition: "center" },
  dumplings: { src: "/food/categories/dumplings.jpg", objectPosition: "center" },
  "wonton-soup": { src: "/food/categories/wonton-soup.jpg", objectPosition: "center" },
  bibimbap: { src: "/food/categories/bibimbap.jpg", objectPosition: "center" },
  "milk-tea": { src: "/food/categories/milk-tea.jpg", objectPosition: "center" },
  coffee: { src: "/food/categories/coffee.jpg", objectPosition: "center" },
} as const satisfies Record<string, FoodImageAsset>;

export const DISH_FOOD_IMAGE_ASSETS = {
  "mushroom-chicken-rice": { src: "/food/dishes/mushroom-chicken-rice.jpg", objectPosition: "center" },
  "potato-beef-rice": { src: "/food/dishes/potato-beef-rice.jpg", objectPosition: "center" },
  "tomato-egg-rice": { src: "/food/dishes/tomato-egg-rice.jpg", objectPosition: "center" },
  "black-bean-pork-rib-rice": { src: "/food/dishes/black-bean-pork-rib-rice.jpg", objectPosition: "center" },
  "teriyaki-chicken-rice": { src: "/food/dishes/teriyaki-chicken-rice.jpg", objectPosition: "center" },
  "yuxiang-pork-rice": { src: "/food/dishes/yuxiang-pork-rice.jpg", objectPosition: "center" },
  "braised-pork-rice": { src: "/food/dishes/braised-pork-rice.jpg", objectPosition: "center" },
  "zhajiang-noodles": { src: "/food/dishes/zhajiang-noodles.jpg", objectPosition: "center" },
  "chongqing-noodles": { src: "/food/dishes/chongqing-noodles.jpg", objectPosition: "center" },
  "chicken-wonton-noodles": { src: "/food/dishes/chicken-wonton-noodles.jpg", objectPosition: "center" },
  "guilin-rice-noodles": { src: "/food/dishes/guilin-rice-noodles.jpg", objectPosition: "center" },
  "hunan-beef-rice-noodles": { src: "/food/dishes/hunan-beef-rice-noodles.jpg", objectPosition: "center" },
  luosifen: { src: "/food/dishes/luosifen.jpg", objectPosition: "center" },
  "sour-beef-rice-noodles": { src: "/food/dishes/sour-beef-rice-noodles.jpg", objectPosition: "center" },
  "spicy-chicken-burger": { src: "/food/dishes/spicy-chicken-burger.jpg", objectPosition: "center" },
  "double-cheese-burger": { src: "/food/dishes/double-cheese-burger.jpg", objectPosition: "center" },
  "korean-fried-chicken": { src: "/food/dishes/korean-fried-chicken.jpg", objectPosition: "center" },
  "teriyaki-chicken-don": { src: "/food/dishes/teriyaki-chicken-don.jpg", objectPosition: "center" },
  "eel-rice": { src: "/food/dishes/eel-rice.jpg", objectPosition: "center" },
  "beef-udon": { src: "/food/dishes/beef-udon.jpg", objectPosition: "center" },
  "black-pepper-beef-grain-bowl": { src: "/food/dishes/black-pepper-beef-grain-bowl.jpg", objectPosition: "center" },
  "whole-wheat-egg-sandwich": { src: "/food/dishes/whole-wheat-egg-sandwich.jpg", objectPosition: "center" },
  "shrimp-quinoa-bowl": { src: "/food/dishes/shrimp-quinoa-bowl.jpg", objectPosition: "center" },
  "caesar-chicken-salad": { src: "/food/dishes/caesar-chicken-salad.jpg", objectPosition: "center" },
  "tuna-potato-salad": { src: "/food/dishes/tuna-potato-salad.jpg", objectPosition: "center" },
  "avocado-shrimp-salad": { src: "/food/dishes/avocado-shrimp-salad.jpg", objectPosition: "center" },
  "roasted-pumpkin-salad": { src: "/food/dishes/roasted-pumpkin-salad.jpg", objectPosition: "center" },
  "shuizhu-pork": { src: "/food/dishes/shuizhu-pork.jpg", objectPosition: "center" },
  "jasmine-milk-green-tea": { src: "/food/dishes/jasmine-milk-green-tea.jpg", objectPosition: "center" },
  "taro-boba-milk-tea": { src: "/food/dishes/taro-boba-milk-tea.jpg", objectPosition: "center" },
  "fresh-lemon-tea": { src: "/food/dishes/fresh-lemon-tea.jpg", objectPosition: "center" },
  "iced-americano": { src: "/food/dishes/iced-americano.jpg", objectPosition: "center" },
  latte: { src: "/food/dishes/latte.jpg", objectPosition: "center" },
  "coconut-latte": { src: "/food/dishes/coconut-latte.jpg", objectPosition: "center" },
  "oat-milk-coffee": { src: "/food/dishes/oat-milk-coffee.jpg", objectPosition: "center" },
} as const satisfies Record<string, FoodImageAsset>;

export const FOOD_IMAGE_ASSETS = {
  ...CATEGORY_FOOD_IMAGE_ASSETS,
  ...DISH_FOOD_IMAGE_ASSETS,
} as const;

export type FoodImageKey = keyof typeof FOOD_IMAGE_ASSETS;
export type FoodVisual = Pick<Dish, "id" | "name" | "category">;

export const FOOD_IMAGE_FALLBACK: FoodImageKey = "rice-bowl";

export function resolveFoodImageAsset(key: FoodImageKey) {
  const asset = FOOD_IMAGE_ASSETS[key];
  return { ...asset, src: prefixWithBasePath(asset.src) };
}

export const DISH_IMAGE_KEYS = {
  "dish-001": "mushroom-chicken-rice",
  "dish-002": "potato-beef-rice",
  "dish-003": "tomato-egg-rice",
  "dish-004": "black-bean-pork-rib-rice",
  "dish-005": "tomato-beef-rice",
  "dish-006": "teriyaki-chicken-rice",
  "dish-007": "yuxiang-pork-rice",
  "dish-008": "braised-pork-rice",
  "dish-009": "noodles",
  "dish-010": "zhajiang-noodles",
  "dish-011": "chongqing-noodles",
  "dish-012": "chicken-wonton-noodles",
  "dish-013": "guilin-rice-noodles",
  "dish-014": "hunan-beef-rice-noodles",
  "dish-015": "luosifen",
  "dish-016": "sour-beef-rice-noodles",
  "dish-017": "mala-bowl",
  "dish-021": "hotpot",
  "dish-025": "grilled-platter",
  "dish-029": "burger",
  "dish-030": "spicy-chicken-burger",
  "dish-031": "double-cheese-burger",
  "dish-033": "fried-chicken",
  "dish-034": "korean-fried-chicken",
  "dish-037": "pizza",
  "dish-041": "teriyaki-chicken-don",
  "dish-042": "eel-rice",
  "dish-043": "sushi",
  "dish-044": "beef-udon",
  "dish-045": "bibimbap",
  "dish-049": "salad-bowl",
  "dish-050": "black-pepper-beef-grain-bowl",
  "dish-051": "whole-wheat-egg-sandwich",
  "dish-052": "shrimp-quinoa-bowl",
  "dish-053": "caesar-chicken-salad",
  "dish-054": "tuna-potato-salad",
  "dish-055": "avocado-shrimp-salad",
  "dish-056": "roasted-pumpkin-salad",
  "dish-057": "porridge",
  "dish-061": "dumplings",
  "dish-065": "wonton-soup",
  "dish-069": "milk-tea",
  "dish-070": "jasmine-milk-green-tea",
  "dish-071": "taro-boba-milk-tea",
  "dish-072": "fresh-lemon-tea",
  "dish-073": "iced-americano",
  "dish-074": "latte",
  "dish-075": "coconut-latte",
  "dish-076": "oat-milk-coffee",
  "dish-079": "shuizhu-pork",
} as const satisfies Partial<Record<string, FoodImageKey>>;

export const CATEGORY_IMAGE_KEYS = {
  中式快餐: "rice-bowl",
  盖饭: "rice-bowl",
  面食: "noodles",
  米粉: "noodles",
  麻辣烫: "mala-bowl",
  火锅: "hotpot",
  烧烤: "grilled-platter",
  汉堡: "burger",
  炸鸡: "fried-chicken",
  披萨: "pizza",
  日料: "sushi",
  韩餐: "bibimbap",
  轻食: "salad-bowl",
  沙拉: "salad-bowl",
  粥: "porridge",
  饺子: "dumplings",
  馄饨: "wonton-soup",
  奶茶: "milk-tea",
  咖啡: "coffee",
  川菜: "mala-bowl",
  粤菜: "rice-bowl",
  湘菜: "grilled-platter",
  地方菜: "rice-bowl",
} as const satisfies Record<string, FoodImageKey>;

export function resolveFoodImage(food: FoodVisual) {
  const key = DISH_IMAGE_KEYS[food.id as keyof typeof DISH_IMAGE_KEYS]
    ?? CATEGORY_IMAGE_KEYS[food.category as keyof typeof CATEGORY_IMAGE_KEYS]
    ?? FOOD_IMAGE_FALLBACK;
  return { key, ...resolveFoodImageAsset(key) };
}
