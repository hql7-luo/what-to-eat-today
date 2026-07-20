import type { RecommendationCandidate } from "@/types";

export const ROULETTE_TARGET_INDEX = 43;
export const ROULETTE_TRACK_LENGTH = 50;

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function rotateAwayFrom<T>(items: T[], previous: T | undefined): T[] {
  if (items.length < 2 || items[0] !== previous) return items;
  const alternativeIndex = items.findIndex((item) => item !== previous);
  if (alternativeIndex <= 0) return items;
  return [...items.slice(alternativeIndex), ...items.slice(0, alternativeIndex)];
}

export function buildRouletteTrack(
  candidates: readonly RecommendationCandidate[],
  winner?: RecommendationCandidate,
  random: () => number = Math.random,
  length = ROULETTE_TRACK_LENGTH,
  targetIndex = ROULETTE_TARGET_INDEX,
): RecommendationCandidate[] {
  if (candidates.length === 0 || length <= 0) return [];

  const track: RecommendationCandidate[] = [];
  while (track.length < length) {
    const nextBatch = rotateAwayFrom(shuffled(candidates, random), track.at(-1));
    track.push(...nextBatch.slice(0, length - track.length));
  }

  if (winner && targetIndex >= 0 && targetIndex < track.length) {
    track[targetIndex] = winner;
    if (candidates.length > 1) {
      const alternatives = candidates.filter((candidate) => candidate.id !== winner.id);
      if (targetIndex > 0 && track[targetIndex - 1]?.id === winner.id) {
        track[targetIndex - 1] = alternatives[0];
      }
      if (targetIndex + 1 < track.length && track[targetIndex + 1]?.id === winner.id) {
        track[targetIndex + 1] = alternatives[alternatives.length > 1 ? 1 : 0];
      }
    }
  }

  return track;
}
