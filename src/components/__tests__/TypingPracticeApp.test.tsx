import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { practiceTexts } from "@/lib/practiceTexts";
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
    expect(practiceTexts.ko).toContain(screen.getByTestId("current-prompt").textContent);
  });

  it("starts long-form Korean practice from the long practice tab", () => {
    render(<TypingPracticeApp />);
    fireEvent.change(screen.getByLabelText("닉네임"), { target: { value: "Misty" } });
    fireEvent.click(screen.getByRole("button", { name: "장문" }));
    fireEvent.click(screen.getByRole("button", { name: "달빛 아래의 길 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "연습 시작" }));

    expect(screen.getByTestId("current-prompt")).toHaveTextContent(/달빛이 낮게 내려앉은 마을 길/);
  });

  it("marks mismatched characters in the prompt", () => {
    const { container } = render(<TypingPracticeApp />);
    fireEvent.change(screen.getByLabelText("닉네임"), { target: { value: "Misty" } });
    fireEvent.click(screen.getByRole("button", { name: "연습 시작" }));

    const expectedFirstCharacter = Array.from(screen.getByTestId("current-prompt").textContent ?? "")[0];
    fireEvent.change(screen.getByLabelText("입력"), { target: { value: "X" } });

    const incorrectCharacter = container.querySelector(".incorrect-char");
    expect(incorrectCharacter).toHaveTextContent(expectedFirstCharacter);
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

  it("registers ranking only after the user chooses to submit it", async () => {
    render(<TypingPracticeApp />);
    fireEvent.change(screen.getByLabelText("닉네임"), { target: { value: "Brock" } });
    fireEvent.click(screen.getByRole("button", { name: "피카츄 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "연습 시작" }));

    for (let count = 0; count < 5; count += 1) {
      const currentPrompt = screen.getByTestId("current-prompt").textContent ?? "";
      fireEvent.change(screen.getByLabelText("입력"), { target: { value: currentPrompt } });
    }

    expect(screen.getByText("연습 완료")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "랭킹 등록" }));

    await waitFor(() => expect(screen.getByText("랭킹에 등록되었습니다.")).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("finishes short practice after five random sentences and submits that count", async () => {
    render(<TypingPracticeApp />);
    fireEvent.change(screen.getByLabelText("닉네임"), { target: { value: "Brock" } });
    fireEvent.click(screen.getByRole("button", { name: "연습 시작" }));

    for (let count = 0; count < 5; count += 1) {
      const currentPrompt = screen.getByTestId("current-prompt").textContent ?? "";
      fireEvent.change(screen.getByLabelText("입력"), { target: { value: currentPrompt } });
    }

    expect(screen.getByText("연습 완료")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "랭킹 등록" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)).toMatchObject({
      completedSentences: 5
    });
  });
});
