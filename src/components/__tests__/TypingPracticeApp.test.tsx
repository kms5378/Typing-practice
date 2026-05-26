import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TypingPracticeApp from "../TypingPracticeApp";

describe("TypingPracticeApp", () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () =>
      Response.json({
        rankings: [
          {
            id: "rank-1",
            nickname: "Brock",
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
    ) as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders profile choices from the Pokemon list", () => {
    render(<TypingPracticeApp />);
    expect(screen.getByText("피카츄")).toBeInTheDocument();
    expect(screen.getByText("리아코")).toBeInTheDocument();
  });

  it("starts Korean practice after nickname and profile selection", () => {
    render(<TypingPracticeApp />);
    fireEvent.change(screen.getByLabelText("닉네임"), { target: { value: "Misty" } });
    fireEvent.click(screen.getByRole("button", { name: "피카츄 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "연습 시작" }));
    expect(screen.getByText("오늘도 차분하게 타자 연습을 시작합니다.")).toBeInTheDocument();
  });

  it("returns to setup from an active practice session", () => {
    render(<TypingPracticeApp />);
    fireEvent.change(screen.getByLabelText("닉네임"), { target: { value: "Misty" } });
    fireEvent.click(screen.getByRole("button", { name: "피카츄 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "연습 시작" }));

    fireEvent.change(screen.getByLabelText("입력"), { target: { value: "진행 중 입력" } });
    fireEvent.click(screen.getByRole("button", { name: "처음으로" }));

    expect(screen.getByText("Pokemon Typing Practice")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "연습 시작" })).toBeInTheDocument();
    expect(screen.queryByLabelText("입력")).not.toBeInTheDocument();
  });

  it("shows result after completing all sentences", async () => {
    render(<TypingPracticeApp />);
    fireEvent.change(screen.getByLabelText("닉네임"), { target: { value: "Brock" } });
    fireEvent.click(screen.getByRole("button", { name: "피카츄 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "연습 시작" }));

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
      fireEvent.change(screen.getByLabelText("입력"), { target: { value: sentence } });
    }

    expect(screen.getByText("연습 완료")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("랭킹에 등록되었습니다.")).toBeInTheDocument());
  });
});
