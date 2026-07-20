import { describe, expect, it } from "vitest";

import { dishes } from "@/data/dishes";
import { recommendDishes } from "@/lib/recommendation";
import { buildRouletteTrack, ROULETTE_TARGET_INDEX, ROULETTE_TRACK_LENGTH } from "@/lib/roulette/track";
import { DEFAULT_PREFERENCES } from "@/types";

const candidates = recommendDishes({
  dishes,
  preferences: DEFAULT_PREFERENCES,
  random: () => 0.42,
  limit: 10,
});

function longestAdjacentRun(ids: string[]): number {
  let longest = 0;
  let current = 0;
  let previous = "";
  for (const id of ids) {
    current = id === previous ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = id;
  }
  return longest;
}

describe("buildRouletteTrack", () => {
  it.each([2, 3, 7, 10])("%i 个候选时生成完整且有视觉多样性的轨道", (count) => {
    const track = buildRouletteTrack(candidates.slice(0, count), undefined, () => 0.37);
    const ids = track.map((candidate) => candidate.id);

    expect(track).toHaveLength(ROULETTE_TRACK_LENGTH);
    expect(new Set(ids).size).toBe(count);
    expect(longestAdjacentRun(ids)).toBe(1);
  });

  it("只有一个候选时仍生成可抽取轨道", () => {
    const track = buildRouletteTrack(candidates.slice(0, 1), undefined, () => 0);
    expect(track).toHaveLength(ROULETTE_TRACK_LENGTH);
    expect(new Set(track.map((candidate) => candidate.id)).size).toBe(1);
  });

  it("预先确定的加权结果固定在中心目标位置", () => {
    const winner = candidates[6];
    const track = buildRouletteTrack(candidates.slice(0, 7), winner, () => 0.23);

    expect(track[ROULETTE_TARGET_INDEX]).toBe(winner);
    expect(track[ROULETTE_TARGET_INDEX - 1].id).not.toBe(winner.id);
    expect(track[ROULETTE_TARGET_INDEX + 1].id).not.toBe(winner.id);
  });
});
