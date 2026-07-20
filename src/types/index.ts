export type BudgetOption = "under20" | "20to30" | "30to50" | "over50" | "any";
export type SpicePreference = "none" | "mild" | "medium" | "hot" | "any";
export type DietGoal = "normal" | "fat-loss" | "muscle-gain" | "light" | "indulgent";
export type PartySize = "1" | "2" | "3-4" | "5+";
export type HistoryStatus = "accepted" | "disliked";
export type RelaxedConstraint = "budget" | "goal" | "wait";

export interface Preferences {
  budget: BudgetOption;
  spice: SpicePreference;
  goal: DietGoal;
  partySize: PartySize;
  maxWait: 20 | 30 | 45 | 60 | null;
}

export interface Dish {
  id: string;
  name: string;
  category: string;
  spiceLevel: 0 | 1 | 2 | 3;
  priceRange: [number, number];
  fatLossFriendly: boolean;
  muscleGainFriendly: boolean;
  suitableParties: PartySize[];
  prepTime: number;
  searchKeywords: string[];
}

export interface RecommendationCandidate {
  id: string;
  dishId: string;
  dish: Dish;
  score: number;
  reasons: string[];
  relaxedConstraints: RelaxedConstraint[];
}

export interface HistoryEntry {
  id: string;
  dishId: string;
  dishName: string;
  category: string;
  selectedAt: string;
  status: HistoryStatus;
}

export interface FrequentShop {
  id: string;
  name: string;
  dishId: string;
  dishName: string;
  approximatePrice: number;
  createdAt: string;
}

export interface TasteProfile {
  favorites: string[];
  categoryWeights: Record<string, number>;
  commonBudget: BudgetOption;
  preferredSpice: SpicePreference;
}

export const DEFAULT_PREFERENCES: Preferences = {
  budget: "any",
  spice: "any",
  goal: "normal",
  partySize: "1",
  maxWait: 30,
};
