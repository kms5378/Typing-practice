import { expect, test } from "@playwright/test";

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
            completedSentences: 10,
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

  const sentences = [
    "오늘도 차분하게 타자 연습을 시작합니다.",
    "정확한 입력은 빠른 속도보다 먼저입니다.",
    "작은 습관이 꾸준한 실력을 만듭니다.",
    "화면의 문장을 보고 그대로 입력하세요.",
    "실수해도 괜찮으니 천천히 고쳐 보세요.",
    "한글 타자는 리듬을 익히는 과정입니다.",
    "집중해서 끝까지 문장을 완성합니다.",
    "손가락 위치를 유지하면 속도가 올라갑니다.",
    "매일 조금씩 연습하면 기록이 좋아집니다.",
    "마지막 문장까지 정확하게 입력합니다."
  ];

  for (const sentence of sentences) {
    await page.getByLabel("입력").fill(sentence);
  }

  await expect(page.getByText("연습 완료")).toBeVisible();
  await expect(page.getByText(/최종 타수/)).toBeVisible();
  await expect(page.getByText("랭킹에 등록되었습니다.")).toBeVisible();
});
