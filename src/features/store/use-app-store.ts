"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  createValidatedStateStorage,
  migratePersistedState,
  PERSIST_VERSION,
  pickPersistedState,
  STORE_KEY,
  type PersistedAppState,
} from "@/features/store/persistence";
import type {
  FrequentShop,
  HistoryEntry,
  Preferences,
  RecommendationCandidate,
  TasteProfile,
} from "@/types";
import { DEFAULT_PREFERENCES } from "@/types";

interface NewFrequentShop {
  name: string;
  dishId: string;
  dishName: string;
  approximatePrice: number;
}

interface AppState {
  hasHydrated: boolean;
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
  setHasHydrated: (value: boolean) => void;
  setPreferences: (preferences: Partial<Preferences>) => void;
  setCandidates: (candidates: RecommendationCandidate[]) => void;
  setSelectedCandidate: (candidate?: RecommendationCandidate) => void;
  excludeCurrentResult: () => void;
  dislikeCurrentResult: () => void;
  acceptCurrentResult: () => void;
  toggleFavorite: (dishId: string) => void;
  addFrequentShop: (shop: NewFrequentShop) => void;
  removeFrequentShop: (shopId: string) => void;
  toggleSound: () => void;
  startNewRound: () => void;
  clearHistory: () => void;
  resetPreferences: () => void;
}

const initialTasteProfile: TasteProfile = {
  favorites: [],
  categoryWeights: {},
  commonBudget: "any",
  preferredSpice: "any",
};

function randomId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function historyFromCandidate(
  candidate: RecommendationCandidate,
  status: HistoryEntry["status"],
  resultId: string,
): HistoryEntry {
  return {
    id: `${status}:${resultId}`,
    dishId: candidate.dishId,
    dishName: candidate.dish.name,
    category: candidate.dish.category,
    selectedAt: new Date().toISOString(),
    status,
  };
}

function createResultId(candidate: RecommendationCandidate): string {
  return `${candidate.id}:${randomId()}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      preferences: DEFAULT_PREFERENCES,
      candidates: [],
      acceptedResultIds: [],
      sessionExcludedDishIds: [],
      sessionDislikedDishIds: [],
      history: [],
      tasteProfile: initialTasteProfile,
      frequentShops: [],
      soundEnabled: true,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setPreferences: (preferences) =>
        set((state) => ({ preferences: { ...state.preferences, ...preferences } })),
      setCandidates: (candidates) => set({ candidates }),
      setSelectedCandidate: (selectedCandidate) => set(selectedCandidate
        ? { selectedCandidate, selectedResultId: createResultId(selectedCandidate) }
        : { selectedCandidate: undefined, selectedResultId: undefined }),
      excludeCurrentResult: () => {
        const candidate = get().selectedCandidate;
        if (!candidate) return;
        set((state) => ({
          sessionExcludedDishIds: [...new Set([...state.sessionExcludedDishIds, candidate.dishId])],
          selectedCandidate: undefined,
          selectedResultId: undefined,
        }));
      },
      dislikeCurrentResult: () => {
        const { selectedCandidate: candidate, selectedResultId } = get();
        if (!candidate || !selectedResultId) return;
        set((state) => ({
          sessionExcludedDishIds: [...new Set([...state.sessionExcludedDishIds, candidate.dishId])],
          sessionDislikedDishIds: [...new Set([...state.sessionDislikedDishIds, candidate.dishId])],
          history: state.history.some((entry) => entry.id === `disliked:${selectedResultId}`)
            ? state.history
            : [historyFromCandidate(candidate, "disliked", selectedResultId), ...state.history].slice(0, 120),
          selectedCandidate: undefined,
          selectedResultId: undefined,
        }));
      },
      acceptCurrentResult: () => {
        set((state) => {
          const candidate = state.selectedCandidate;
          const resultId = state.selectedResultId;
          if (!candidate || !resultId || state.acceptedResultIds.includes(resultId)) return state;
          return {
            history: [historyFromCandidate(candidate, "accepted", resultId), ...state.history].slice(0, 120),
            acceptedResultIds: [...state.acceptedResultIds, resultId].slice(-240),
            tasteProfile: {
              ...state.tasteProfile,
              commonBudget: state.preferences.budget,
              preferredSpice: state.preferences.spice,
              categoryWeights: {
                ...state.tasteProfile.categoryWeights,
                [candidate.dish.category]:
                  (state.tasteProfile.categoryWeights[candidate.dish.category] ?? 0) + 1,
              },
            },
          };
        });
      },
      toggleFavorite: (dishId) =>
        set((state) => ({
          tasteProfile: {
            ...state.tasteProfile,
            favorites: state.tasteProfile.favorites.includes(dishId)
              ? state.tasteProfile.favorites.filter((id) => id !== dishId)
              : [...state.tasteProfile.favorites, dishId],
          },
        })),
      addFrequentShop: (shop) => set((state) => ({
        frequentShops: [
          {
            id: randomId(),
            name: shop.name.trim(),
            dishId: shop.dishId,
            dishName: shop.dishName,
            approximatePrice: Math.round(shop.approximatePrice),
            createdAt: new Date().toISOString(),
          },
          ...state.frequentShops,
        ].slice(0, 60),
      })),
      removeFrequentShop: (shopId) => set((state) => ({
        frequentShops: state.frequentShops.filter((shop) => shop.id !== shopId),
      })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      startNewRound: () =>
        set({
          candidates: [],
          selectedCandidate: undefined,
          selectedResultId: undefined,
          acceptedResultIds: [],
          sessionExcludedDishIds: [],
          sessionDislikedDishIds: [],
        }),
      clearHistory: () => set({ history: [] }),
      resetPreferences: () =>
        set({
          preferences: DEFAULT_PREFERENCES,
          tasteProfile: initialTasteProfile,
          sessionExcludedDishIds: [],
          sessionDislikedDishIds: [],
        }),
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage<PersistedAppState>(() => createValidatedStateStorage(localStorage)),
      partialize: (state) => pickPersistedState(state),
      migrate: (persistedState, version) => migratePersistedState(persistedState, version),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          return;
        }
        queueMicrotask(() => useAppStore.setState({ hasHydrated: true }));
      },
      version: PERSIST_VERSION,
    },
  ),
);
