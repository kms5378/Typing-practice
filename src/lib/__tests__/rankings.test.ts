import { describe, expect, it } from "vitest";
import { buildRankingEntry, isRankingEntryValid, sortRankings } from "../rankings";

describe("rankings", () => {
  it("builds a validated ranking entry", () => {
    const entry = buildRankingEntry({
      nickname: "Ash",
      pokemonId: 25,
      language: "ko",
      practiceMode: "short",
      cpm: 320,
      accuracy: 96,
      elapsedMs: 45_000,
      completedSentences: 5
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
        practiceMode: "short",
        cpm: 500,
        accuracy: 70,
        elapsedMs: 20_000,
        completedSentences: 5
      })
    ).toThrow("정확도 80 이상만 랭킹에 등록할 수 있습니다.");
  });

  it("rejects manipulated short practice completion counts", () => {
    expect(() =>
      buildRankingEntry({
        nickname: "Ash",
        pokemonId: 25,
        language: "ko",
        practiceMode: "short",
        cpm: 300,
        accuracy: 100,
        elapsedMs: 20_000,
        completedSentences: 1
      })
    ).toThrow("짧은 문장 랭킹은 5개 문장 완료 기록만 등록할 수 있습니다.");
  });

  it("rejects implausibly fast ranking entries", () => {
    expect(() =>
      buildRankingEntry({
        nickname: "Ash",
        pokemonId: 25,
        language: "ko",
        practiceMode: "short",
        cpm: 12_280,
        accuracy: 100,
        elapsedMs: 601,
        completedSentences: 5
      })
    ).toThrow("비정상적으로 빠른 기록은 랭킹에 등록할 수 없습니다.");
  });

  it("marks legacy implausible entries as invalid", () => {
    const legacyEntry = buildRankingEntry({
      nickname: "Ash",
      pokemonId: 25,
      language: "ko",
      practiceMode: "short",
      cpm: 300,
      accuracy: 100,
      elapsedMs: 20_000,
      completedSentences: 5
    });

    expect(
      isRankingEntryValid({
        ...legacyEntry,
        practiceMode: undefined,
        cpm: 623,
        elapsedMs: 11_852,
        completedSentences: 1
      })
    ).toBe(false);
  });

  it("sorts rankings by cpm then accuracy", () => {
    const entries = [
      buildRankingEntry({
        nickname: "A",
        pokemonId: 1,
        language: "ko",
        practiceMode: "short",
        cpm: 250,
        accuracy: 99,
        elapsedMs: 50_000,
        completedSentences: 5
      }),
      buildRankingEntry({
        nickname: "B",
        pokemonId: 4,
        language: "ko",
        practiceMode: "short",
        cpm: 280,
        accuracy: 90,
        elapsedMs: 50_000,
        completedSentences: 5
      }),
      buildRankingEntry({
        nickname: "C",
        pokemonId: 7,
        language: "ko",
        practiceMode: "short",
        cpm: 280,
        accuracy: 95,
        elapsedMs: 50_000,
        completedSentences: 5
      })
    ];

    expect(sortRankings(entries).map((entry) => entry.nickname)).toEqual(["C", "B", "A"]);
  });
});
