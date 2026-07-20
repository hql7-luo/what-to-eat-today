import type { Dish, PartySize } from "@/types";

type DishSeed = {
  name: string;
  spice?: 0 | 1 | 2 | 3;
  fatLoss?: boolean;
  muscleGain?: boolean;
  priceShift?: number;
  prepShift?: number;
};

type CategoryProfile = {
  category: string;
  dishes: DishSeed[];
  price: [number, number];
  prepTime: number;
  defaultSpice: 0 | 1 | 2 | 3;
  parties: PartySize[];
};

const profiles: CategoryProfile[] = [
  { category: "中式快餐", dishes: [{ name: "香菇滑鸡饭", muscleGain: true }, { name: "土豆牛腩饭", muscleGain: true }, { name: "番茄炒蛋饭", fatLoss: true }, { name: "豉汁排骨饭" }], price: [18, 32], prepTime: 24, defaultSpice: 0, parties: ["1", "2", "3-4"] },
  { category: "盖饭", dishes: [{ name: "番茄牛腩饭", muscleGain: true }, { name: "照烧鸡腿饭", muscleGain: true }, { name: "鱼香肉丝盖饭", spice: 1 }, { name: "卤肉饭" }], price: [20, 36], prepTime: 25, defaultSpice: 0, parties: ["1", "2"] },
  { category: "面食", dishes: [{ name: "兰州牛肉面", muscleGain: true }, { name: "老北京炸酱面" }, { name: "重庆小面", spice: 2 }, { name: "鸡汤馄饨面", fatLoss: true }], price: [16, 32], prepTime: 20, defaultSpice: 0, parties: ["1", "2"] },
  { category: "米粉", dishes: [{ name: "桂林卤粉" }, { name: "湖南牛肉米粉", spice: 2, muscleGain: true }, { name: "螺蛳粉", spice: 2 }, { name: "酸汤肥牛米线", spice: 1 }], price: [18, 34], prepTime: 22, defaultSpice: 1, parties: ["1", "2"] },
  { category: "麻辣烫", dishes: [{ name: "骨汤麻辣烫", spice: 1 }, { name: "麻酱拌麻辣烫", spice: 2 }, { name: "番茄汤冒菜", spice: 0 }, { name: "川味麻辣拌", spice: 3 }], price: [22, 45], prepTime: 28, defaultSpice: 2, parties: ["1", "2", "3-4"] },
  { category: "火锅", dishes: [{ name: "一人小火锅", spice: 1 }, { name: "番茄牛肉小火锅", spice: 0 }, { name: "麻辣牛油火锅", spice: 3 }, { name: "潮汕牛肉火锅", spice: 0, muscleGain: true }], price: [38, 98], prepTime: 38, defaultSpice: 2, parties: ["1", "2", "3-4", "5+"] },
  { category: "烧烤", dishes: [{ name: "孜然羊肉串", spice: 1, muscleGain: true }, { name: "东北烤肉拼盘" }, { name: "烤鸡翅套餐" }, { name: "蔬菜烧烤拼盘", fatLoss: true }], price: [28, 78], prepTime: 38, defaultSpice: 1, parties: ["1", "2", "3-4", "5+"] },
  { category: "汉堡", dishes: [{ name: "经典牛肉堡", muscleGain: true }, { name: "香辣鸡腿堡", spice: 1 }, { name: "双层芝士牛肉堡", priceShift: 8 }, { name: "菌菇蔬菜堡", fatLoss: true }], price: [22, 48], prepTime: 20, defaultSpice: 0, parties: ["1", "2", "3-4"] },
  { category: "炸鸡", dishes: [{ name: "脆皮鸡腿饭" }, { name: "韩式甜辣炸鸡", spice: 1 }, { name: "原味炸鸡块" }, { name: "椒盐鸡翅", spice: 1 }], price: [24, 58], prepTime: 28, defaultSpice: 0, parties: ["1", "2", "3-4", "5+"] },
  { category: "披萨", dishes: [{ name: "玛格丽特披萨" }, { name: "黑椒牛肉披萨", muscleGain: true }, { name: "夏威夷披萨" }, { name: "香辣鸡肉披萨", spice: 1 }], price: [36, 88], prepTime: 35, defaultSpice: 0, parties: ["1", "2", "3-4", "5+"] },
  { category: "日料", dishes: [{ name: "照烧鸡肉丼", muscleGain: true }, { name: "鳗鱼饭" }, { name: "三文鱼寿司套餐", fatLoss: true }, { name: "牛肉乌冬面" }], price: [28, 68], prepTime: 28, defaultSpice: 0, parties: ["1", "2", "3-4"] },
  { category: "韩餐", dishes: [{ name: "石锅拌饭", spice: 1 }, { name: "部队锅", spice: 2 }, { name: "烤牛肉拌饭", muscleGain: true }, { name: "泡菜豆腐汤", spice: 1, fatLoss: true }], price: [26, 58], prepTime: 30, defaultSpice: 1, parties: ["1", "2", "3-4"] },
  { category: "轻食", dishes: [{ name: "鸡胸肉能量碗", fatLoss: true, muscleGain: true }, { name: "黑椒牛肉谷物碗", fatLoss: true, muscleGain: true }, { name: "全麦鸡蛋三明治", fatLoss: true }, { name: "虾仁藜麦碗", fatLoss: true, muscleGain: true }], price: [25, 48], prepTime: 20, defaultSpice: 0, parties: ["1", "2"] },
  { category: "沙拉", dishes: [{ name: "凯撒鸡肉沙拉", fatLoss: true, muscleGain: true }, { name: "金枪鱼土豆沙拉", fatLoss: true }, { name: "牛油果鲜虾沙拉", fatLoss: true }, { name: "烤南瓜时蔬沙拉", fatLoss: true }], price: [22, 46], prepTime: 18, defaultSpice: 0, parties: ["1", "2"] },
  { category: "粥", dishes: [{ name: "皮蛋瘦肉粥", fatLoss: true }, { name: "鲜虾海鲜粥", fatLoss: true, muscleGain: true }, { name: "南瓜小米粥", fatLoss: true }, { name: "香菇鸡丝粥", fatLoss: true, muscleGain: true }], price: [12, 32], prepTime: 20, defaultSpice: 0, parties: ["1", "2", "3-4"] },
  { category: "饺子", dishes: [{ name: "猪肉白菜水饺" }, { name: "韭菜鸡蛋水饺" }, { name: "虾仁三鲜水饺", muscleGain: true }, { name: "牛肉洋葱煎饺", muscleGain: true }], price: [16, 36], prepTime: 24, defaultSpice: 0, parties: ["1", "2", "3-4", "5+"] },
  { category: "馄饨", dishes: [{ name: "鲜肉小馄饨" }, { name: "荠菜大馄饨" }, { name: "虾仁云吞", muscleGain: true }, { name: "红油抄手", spice: 2 }], price: [15, 32], prepTime: 20, defaultSpice: 0, parties: ["1", "2"] },
  { category: "奶茶", dishes: [{ name: "经典珍珠奶茶" }, { name: "茉香奶绿" }, { name: "芋泥波波奶茶" }, { name: "鲜柠檬茶", fatLoss: true }], price: [12, 26], prepTime: 12, defaultSpice: 0, parties: ["1", "2", "3-4", "5+"] },
  { category: "咖啡", dishes: [{ name: "冰美式", fatLoss: true }, { name: "拿铁咖啡" }, { name: "生椰拿铁" }, { name: "燕麦奶咖", fatLoss: true }], price: [14, 30], prepTime: 10, defaultSpice: 0, parties: ["1", "2", "3-4", "5+"] },
  { category: "川菜", dishes: [{ name: "麻婆豆腐饭", spice: 2 }, { name: "回锅肉饭", spice: 2 }, { name: "水煮肉片", spice: 3, muscleGain: true }, { name: "宫保鸡丁饭", spice: 1 }], price: [22, 48], prepTime: 30, defaultSpice: 2, parties: ["1", "2", "3-4", "5+"] },
  { category: "粤菜", dishes: [{ name: "广式烧鸭饭" }, { name: "蜜汁叉烧饭" }, { name: "豉油鸡饭", muscleGain: true }, { name: "白灼时蔬拼鸡", fatLoss: true, muscleGain: true }], price: [24, 48], prepTime: 26, defaultSpice: 0, parties: ["1", "2", "3-4", "5+"] },
  { category: "湘菜", dishes: [{ name: "小炒黄牛肉", spice: 3, muscleGain: true }, { name: "农家一碗香", spice: 2 }, { name: "剁椒鱼块", spice: 3, muscleGain: true }, { name: "辣椒炒肉饭", spice: 2 }], price: [24, 52], prepTime: 30, defaultSpice: 2, parties: ["1", "2", "3-4", "5+"] },
  { category: "地方菜", dishes: [{ name: "海南鸡饭", fatLoss: true, muscleGain: true }, { name: "新疆大盘鸡", spice: 1, muscleGain: true, priceShift: 12 }, { name: "陕西肉夹馍套餐" }, { name: "云南汽锅鸡", fatLoss: true, muscleGain: true }], price: [22, 58], prepTime: 32, defaultSpice: 0, parties: ["1", "2", "3-4", "5+"] },
];

let dishIndex = 0;

export const dishes: Dish[] = profiles.flatMap((profile) =>
  profile.dishes.map((seed) => {
    dishIndex += 1;
    const shift = seed.priceShift ?? 0;
    return {
      id: `dish-${String(dishIndex).padStart(3, "0")}`,
      name: seed.name,
      category: profile.category,
      spiceLevel: seed.spice ?? profile.defaultSpice,
      priceRange: [profile.price[0] + shift, profile.price[1] + shift],
      fatLossFriendly: seed.fatLoss ?? false,
      muscleGainFriendly: seed.muscleGain ?? false,
      suitableParties: profile.parties,
      prepTime: profile.prepTime + (seed.prepShift ?? 0),
      searchKeywords: [seed.name, profile.category],
    } satisfies Dish;
  }),
);

export const dishesById = new Map(dishes.map((dish) => [dish.id, dish]));

export const dishCategories = profiles.map((profile) => profile.category);

export function getDishesByCategories(categories: string[]): Dish[] {
  return dishes.filter((dish) => categories.includes(dish.category));
}
