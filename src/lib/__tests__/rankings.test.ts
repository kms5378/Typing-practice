import { describe, expect, it } from "vitest";
import { buildRankingEntry, sortRankings } from "../rankings";

describe("rankings", () => {
  it("builds a validated ranking entry", () => {
    const entry = buildRankingEntry({
      nickname: "Ash",
      pokemonId: 25,
      language: "ko",
      cpm: 320,
      accuracy: 96,
      elapsedMs: 45_000,
      completedSentences: 10
    });

    expect(entry.nickname).toBe("Ash");
    expect(entry.pokemonName).toBe("피카츄");
    expect(entry.pokemonImageUrl).toContain("/25.png");
  });

  it("rejects low accuracy ranking entries", () => {
    expect(() =>
      buildRankingEntry({
        nickname: "Ash",
        pokemonId: 25,
        language: "en",
        cpm: 500,
        accuracy: 70,
        elapsedMs: 20_000,
        completedSentences: 10
      })
    ).toThrow("정확도 80 이상만 랭킹에 등록할 수 있습니다.");
  });

  it("sorts rankings by cpm then accuracy", () => {
    const entries = [
      buildRankingEntry({
        nickname: "A",
        pokemonId: 1,
        language: "ko",
        cpm: 250,
        accuracy: 99,
        elapsedMs: 50_000,
        completedSentences: 10
      }),
      buildRankingEntry({
        nickname: "B",
        pokemonId: 4,
        language: "ko",
        cpm: 280,
        accuracy: 90,
        elapsedMs: 50_000,
        completedSentences: 10
      }),
      buildRankingEntry({
        nickname: "C",
        pokemonId: 7,
        language: "ko",
        cpm: 280,
        accuracy: 95,
        elapsedMs: 50_000,
        completedSentences: 10
      })
    ];

    expect(sortRankings(entries).map((entry) => entry.nickname)).toEqual(["C", "B", "A"]);
  });
});
