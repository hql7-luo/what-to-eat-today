import type { StateStorage } from "zustand/middleware";

import type {
  BudgetOption,
  DietGoal,
  Dish,
  FrequentShop,
  HistoryEntry,
  PartySize,
  Preferences,
  RecommendationCandidate,
  RelaxedConstraint,
  SpicePreference,
  TasteProfile,
} from "@/types";
import { DEFAULT_PREFERENCES } from "@/types";

export const STORE_KEY = "what-to-eat-today:store";
export const PERSIST_VERSION = 3;
export const CORRUPT_STORAGE_PREFIX = `${STORE_KEY}:corrupt:`;

export interface PersistedAppState {
  preferences: Preferences;
  candidates: RecommendationCandidate[];
  selectedCandidate?: RecommendationCandidate;
  selectedResultId?: string;
  acceptedResultIds: string[];
  sessionExcludedDishIds: string[];
  sessionDislikedDishIds: string[];
  history: HistoryEntry[];
  tasteProfile: TasteProfile;
  frequentShops: FrequentShop[];
  soundEnabled: boolean;
}

interface StorageLike {
  getItem(name: string): string | null;
  setItem(name: string, value: string): void;
  removeItem(name: string): void;
}

const budgets = new Set<BudgetOption>(["under20", "20to30", "30to50", "over50", "any"]);
const spices = new Set<SpicePreference>(["none", "mild", "medium", "hot", "any"]);
const goals = new Set<DietGoal>(["normal", "fat-loss", "muscle-gain", "light", "indulgent"]);
const parties = new Set<PartySize>(["1", "2", "3-4", "5+"]);
const relaxedConstraints = new Set<RelaxedConstraint>(["budget", "goal", "wait"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseString(value: unknown, maxLength = 240, minLength = 1): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (normalized.length < minLength || normalized.length > maxLength) return undefined;
  return normalized;
}

function parseNumber(value: unknown, min: number, max: number): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
    ? value
    : undefined;
}

function parseStringArray(value: unknown, maxItems: number, maxLength = 240): string[] | undefined {
  if (!Array.isArray(value) || value.length > maxItems) return undefined;
  const parsed = value.map((item) => parseString(item, maxLength));
  return parsed.every((item): item is string => item !== undefined) ? [...new Set(parsed)] : undefined;
}

function parsePreferences(value: unknown): Preferences | undefined {
  if (!isRecord(value)) return undefined;
  const maxWait = value.maxWait;
  if (!budgets.has(value.budget as BudgetOption)
    || !spices.has(value.spice as SpicePreference)
    || !goals.has(value.goal as DietGoal)
    || !parties.has(value.partySize as PartySize)
    || ![20, 30, 45, 60, null].includes(maxWait as 20)) return undefined;
  return {
    budget: value.budget as BudgetOption,
    spice: value.spice as SpicePreference,
    goal: value.goal as DietGoal,
    partySize: value.partySize as PartySize,
    maxWait: maxWait as Preferences["maxWait"],
  };
}

function parseDish(value: unknown): Dish | undefined {
  if (!isRecord(value)) return undefined;
  const id = parseString(value.id, 120);
  const name = parseString(value.name, 120);
  const category = parseString(value.category, 80);
  const spiceLevel = parseNumber(value.spiceLevel, 0, 3);
  const prepTime = parseNumber(value.prepTime, 0, 300);
  const rawSuitableParties = Array.isArray(value.suitableParties) ? value.suitableParties : undefined;
  const suitableParties = rawSuitableParties
    ? rawSuitableParties.filter((item): item is PartySize => parties.has(item as PartySize))
    : undefined;
  const searchKeywords = parseStringArray(value.searchKeywords, 30, 120);
  const priceRange = Array.isArray(value.priceRange) && value.priceRange.length === 2
    ? [parseNumber(value.priceRange[0], 0, 100_000), parseNumber(value.priceRange[1], 0, 100_000)]
    : undefined;
  if (!id || !name || !category || spiceLevel === undefined || prepTime === undefined
    || !suitableParties || suitableParties.length === 0 || suitableParties.length !== rawSuitableParties?.length
    || !searchKeywords || !priceRange || priceRange[0] === undefined || priceRange[1] === undefined
    || priceRange[0] > priceRange[1] || typeof value.fatLossFriendly !== "boolean"
    || typeof value.muscleGainFriendly !== "boolean") return undefined;
  return {
    id,
    name,
    category,
    spiceLevel: spiceLevel as Dish["spiceLevel"],
    priceRange: priceRange as [number, number],
    fatLossFriendly: value.fatLossFriendly,
    muscleGainFriendly: value.muscleGainFriendly,
    suitableParties,
    prepTime,
    searchKeywords,
  };
}

function parseCandidate(value: unknown): RecommendationCandidate | undefined {
  if (!isRecord(value)) return undefined;
  const id = parseString(value.id, 300);
  const dishId = parseString(value.dishId, 120);
  const dish = parseDish(value.dish);
  const score = parseNumber(value.score, 0.01, 100_000);
  const reasons = parseStringArray(value.reasons, 12, 240);
  const rawRelaxed = value.relaxedConstraints;
  const relaxed = Array.isArray(rawRelaxed)
    ? rawRelaxed.filter((item): item is RelaxedConstraint => relaxedConstraints.has(item as RelaxedConstraint))
    : undefined;
  if (!id || !dishId || !dish || score === undefined || !reasons || !relaxed
    || !Array.isArray(rawRelaxed) || relaxed.length !== rawRelaxed.length) return undefined;
  return { id, dishId, dish, score, reasons, relaxedConstraints: [...new Set(relaxed)] };
}

function parseHistory(value: unknown): HistoryEntry[] | undefined {
  if (!Array.isArray(value) || value.length > 120) return undefined;
  const parsed = value.map((entry) => {
    if (!isRecord(entry)) return undefined;
    const id = parseString(entry.id, 300);
    const dishId = parseString(entry.dishId, 120);
    const dishName = parseString(entry.dishName, 120);
    const category = parseString(entry.category, 80);
    const selectedAt = parseString(entry.selectedAt, 60);
    if (!id || !dishId || !dishName || !category || !selectedAt
      || !Number.isFinite(Date.parse(selectedAt)) || !["accepted", "disliked"].includes(String(entry.status))) return undefined;
    return { id, dishId, dishName, category, selectedAt, status: entry.status as HistoryEntry["status"] };
  });
  return parsed.every((entry): entry is HistoryEntry => entry !== undefined) ? parsed : undefined;
}

function parseTasteProfile(value: unknown): TasteProfile | undefined {
  if (!isRecord(value) || !isRecord(value.categoryWeights)) return undefined;
  const favorites = parseStringArray(value.favorites, 200, 120);
  const categoryWeights: Record<string, number> = {};
  for (const [category, count] of Object.entries(value.categoryWeights)) {
    const normalizedCategory = parseString(category, 80);
    const normalizedCount = parseNumber(count, 0, 10_000);
    if (!normalizedCategory || normalizedCount === undefined) return undefined;
    categoryWeights[normalizedCategory] = normalizedCount;
  }
  if (!favorites || !budgets.has(value.commonBudget as BudgetOption) || !spices.has(value.preferredSpice as SpicePreference)) return undefined;
  return {
    favorites,
    categoryWeights,
    commonBudget: value.commonBudget as BudgetOption,
    preferredSpice: value.preferredSpice as SpicePreference,
  };
}

function parseFrequentShops(value: unknown): FrequentShop[] | undefined {
  if (!Array.isArray(value) || value.length > 60) return undefined;
  const parsed = value.map((shop) => {
    if (!isRecord(shop)) return undefined;
    const id = parseString(shop.id, 160);
    const name = parseString(shop.name, 80, 2);
    const dishId = parseString(shop.dishId, 120);
    const dishName = parseString(shop.dishName, 120);
    const approximatePrice = parseNumber(shop.approximatePrice, 1, 10_000);
    const createdAt = parseString(shop.createdAt, 60);
    if (!id || !name || !dishId || !dishName || approximatePrice === undefined || !createdAt
      || !Number.isFinite(Date.parse(createdAt))) return undefined;
    return { id, name, dishId, dishName, approximatePrice, createdAt };
  });
  return parsed.every((shop): shop is FrequentShop => shop !== undefined) ? parsed : undefined;
}

function defaultPersistedState(): PersistedAppState {
  return {
    preferences: { ...DEFAULT_PREFERENCES },
    candidates: [],
    acceptedResultIds: [],
    sessionExcludedDishIds: [],
    sessionDislikedDishIds: [],
    history: [],
    tasteProfile: { favorites: [], categoryWeights: {}, commonBudget: "any", preferredSpice: "any" },
    frequentShops: [],
    soundEnabled: true,
  };
}

export function parsePersistedState(value: unknown): PersistedAppState | undefined {
  if (!isRecord(value)) return undefined;
  const preferences = parsePreferences(value.preferences);
  const candidates = Array.isArray(value.candidates) && value.candidates.length <= 20
    ? value.candidates.map(parseCandidate)
    : undefined;
  const selectedCandidate = value.selectedCandidate === undefined ? undefined : parseCandidate(value.selectedCandidate);
  const selectedResultId = value.selectedResultId === undefined ? undefined : parseString(value.selectedResultId, 320);
  const acceptedResultIds = parseStringArray(value.acceptedResultIds, 240, 320);
  const sessionExcludedDishIds = parseStringArray(value.sessionExcludedDishIds, 200, 120);
  const sessionDislikedDishIds = parseStringArray(value.sessionDislikedDishIds, 200, 120);
  const history = parseHistory(value.history);
  const tasteProfile = parseTasteProfile(value.tasteProfile);
  const frequentShops = parseFrequentShops(value.frequentShops);
  if (!preferences || !candidates || candidates.some((candidate) => candidate === undefined)
    || (value.selectedCandidate !== undefined && !selectedCandidate)
    || (value.selectedResultId !== undefined && !selectedResultId)
    || !acceptedResultIds || !sessionExcludedDishIds || !sessionDislikedDishIds
    || !history || !tasteProfile || !frequentShops || typeof value.soundEnabled !== "boolean") return undefined;
  return {
    preferences,
    candidates: candidates as RecommendationCandidate[],
    ...(selectedCandidate ? { selectedCandidate } : {}),
    ...(selectedResultId ? { selectedResultId } : {}),
    acceptedResultIds,
    sessionExcludedDishIds,
    sessionDislikedDishIds,
    history,
    tasteProfile,
    frequentShops,
    soundEnabled: value.soundEnabled,
  };
}

function migrateLegacyState(value: unknown): PersistedAppState {
  const defaults = defaultPersistedState();
  if (!isRecord(value)) return defaults;
  const preferences = parsePreferences(value.preferences);
  const history = parseHistory(value.history);
  const tasteProfile = parseTasteProfile(value.tasteProfile);
  const sessionExcludedDishIds = parseStringArray(value.sessionExcludedDishIds, 200, 120);
  const sessionDislikedDishIds = parseStringArray(value.sessionDislikedDishIds, 200, 120);
  if (!preferences || !history || !tasteProfile || !sessionExcludedDishIds || !sessionDislikedDishIds
    || typeof value.soundEnabled !== "boolean") return defaults;
  return {
    ...defaults,
    preferences,
    history,
    tasteProfile,
    sessionExcludedDishIds,
    sessionDislikedDishIds,
    soundEnabled: value.soundEnabled,
  };
}

export function migratePersistedState(value: unknown, version: number): PersistedAppState {
  if (version === 1 || version === 2) return migrateLegacyState(value);
  if (version === PERSIST_VERSION) return parsePersistedState(value) ?? defaultPersistedState();
  return defaultPersistedState();
}

export function pickPersistedState(state: PersistedAppState): PersistedAppState {
  return {
    preferences: state.preferences,
    candidates: state.candidates,
    ...(state.selectedCandidate ? { selectedCandidate: state.selectedCandidate } : {}),
    ...(state.selectedResultId ? { selectedResultId: state.selectedResultId } : {}),
    acceptedResultIds: state.acceptedResultIds,
    sessionExcludedDishIds: state.sessionExcludedDishIds,
    sessionDislikedDishIds: state.sessionDislikedDishIds,
    history: state.history,
    tasteProfile: state.tasteProfile,
    frequentShops: state.frequentShops,
    soundEnabled: state.soundEnabled,
  };
}

function quarantine(storage: StorageLike, name: string, raw: string, now: () => number): void {
  try {
    storage.setItem(`${name}:corrupt:${now()}`, raw);
  } catch {
    // 即使浏览器存储已满，也继续恢复默认状态。
  }
  try {
    storage.removeItem(name);
  } catch {
    // 删除失败不能阻止 hydration 完成。
  }
}

export function createValidatedStateStorage(storage: StorageLike, now: () => number = Date.now): StateStorage {
  return {
    getItem(name) {
      let raw: string | null;
      try {
        raw = storage.getItem(name);
      } catch {
        return null;
      }
      if (!raw) return null;
      try {
        const envelope = JSON.parse(raw) as unknown;
        if (!isRecord(envelope) || typeof envelope.version !== "number" || !("state" in envelope)) {
          quarantine(storage, name, raw, now);
          return null;
        }
        const state = envelope.version === 1 || envelope.version === 2
          ? migratePersistedState(envelope.state, envelope.version)
          : envelope.version === PERSIST_VERSION
            ? parsePersistedState(envelope.state)
            : undefined;
        if (!state) {
          quarantine(storage, name, raw, now);
          return null;
        }
        return JSON.stringify({ state, version: PERSIST_VERSION });
      } catch {
        quarantine(storage, name, raw, now);
        return null;
      }
    },
    setItem(name, value) {
      try {
        storage.setItem(name, value);
      } catch {
        // localStorage 配额或隐私模式错误不应中断应用。
      }
    },
    removeItem(name) {
      try {
        storage.removeItem(name);
      } catch {
        // 保持删除操作幂等。
      }
    },
  };
}
