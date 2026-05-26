import { expect, test } from "@playwright/test";
import { practiceTexts } from "../src/lib/practiceTexts";

test("completes the Korean typing flow", async ({ page }) => {
  await page.route("**/api/rankings", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        rankings: [
          {
            id: "rank-1",
            nickname: "Serena",
            pokemonId: 25,
            pokemonName: "피카츄",
            pokemonImageUrl:
              "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
            language: "ko",
            cpm: 200,
            accuracy: 100,
            elapsedMs: 60_000,
            completedSentences: 100,
            createdAt: "2026-05-26T00:00:00.000Z"
          }
        ]
      })
    });
  });

  await page.goto("/");
  await page.getByLabel("닉네임").fill("Serena");
  await page.getByRole("button", { name: "피카츄 선택" }).click();
  await page.getByRole("button", { name: "연습 시작" }).click();

  for (const sentence of practiceTexts.ko) {
    await page.getByLabel("입력").fill(sentence);
  }

  await expect(page.getByText("연습 완료")).toBeVisible();
  await expect(page.getByText(/최종 타수/)).toBeVisible();
  await expect(page.getByText("랭킹에 등록되었습니다.")).toBeVisible();
});
