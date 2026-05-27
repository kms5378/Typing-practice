import { describe, expect, it } from "vitest";
import { getRandomPracticeSet, longPracticeTexts, practiceTexts } from "../practiceTexts";

describe("practice texts", () => {
  it("has 100 short Korean and English sentences", () => {
    expect(practiceTexts.ko).toHaveLength(100);
    expect(practiceTexts.en).toHaveLength(100);
  });

  it("has long practice passages for Korean and English", () => {
    expect(longPracticeTexts.ko).toHaveLength(5);
    expect(longPracticeTexts.en).toHaveLength(5);
    expect(longPracticeTexts.ko.length + longPracticeTexts.en.length).toBe(10);
    expect(longPracticeTexts.ko[0].text.length).toBeGreaterThan(120);
    expect(longPracticeTexts.en[0].text.length).toBeGreaterThan(120);
  });

  it("creates a five sentence random short practice set without duplicates", () => {
    const randomValues = [0.99, 0.5, 0.25, 0.1, 0.01];
    const selected = getRandomPracticeSet(practiceTexts.ko, 5, () => randomValues.shift() ?? 0);

    expect(selected).toHaveLength(5);
    expect(new Set(selected)).toHaveLength(5);
    expect(selected).toEqual([
      practiceTexts.ko[99],
      practiceTexts.ko[50],
      practiceTexts.ko[25],
      practiceTexts.ko[10],
      practiceTexts.ko[1]
    ]);
  });
});
