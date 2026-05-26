import { describe, expect, it } from "vitest";
import { longPracticeTexts, practiceTexts } from "../practiceTexts";

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
});
