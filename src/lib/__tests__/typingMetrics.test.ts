import { describe, expect, it } from "vitest";
import { calculateAccuracy, calculateCpm, countCorrectCharacters } from "../typingMetrics";

describe("typing metrics", () => {
  it("counts matching characters at the same positions", () => {
    expect(countCorrectCharacters("hello", "hallo")).toBe(4);
    expect(countCorrectCharacters("가나다", "가나x")).toBe(2);
  });

  it("calculates accuracy from expected and typed text", () => {
    expect(calculateAccuracy("hello", "hallo")).toBe(80);
    expect(calculateAccuracy("가나다", "가나다")).toBe(100);
  });

  it("calculates CPM from correct characters and elapsed time", () => {
    expect(calculateCpm(120, 60_000)).toBe(120);
    expect(calculateCpm(30, 30_000)).toBe(60);
  });
});
