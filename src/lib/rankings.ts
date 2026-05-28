import { findPokemonProfile } from "./pokemonProfiles";
import { SHORT_SESSION_SENTENCE_COUNT, type PracticeLanguage, type PracticeMode } from "./practiceTexts";

const MAX_CPM = 600;
const MIN_ELAPSED_MS = 3_000;

export type RankingInput = {
  nickname: string;
  pokemonId: number;
  language: PracticeLanguage;
  practiceMode: PracticeMode;
  cpm: number;
  accuracy: number;
  elapsedMs: number;
  completedSentences: number;
};

export type RankingEntry = RankingInput & {
  id: string;
  pokemonName: string;
  pokemonImageUrl: string;
  createdAt: string;
};

function hasValidPracticeScope(input: Pick<RankingInput, "practiceMode" | "completedSentences">) {
  if (input.practiceMode === "short") return input.completedSentences === SHORT_SESSION_SENTENCE_COUNT;
  if (input.practiceMode === "long") return input.completedSentences === 1;
  return false;
}

function hasPlausibleScore(input: Pick<RankingInput, "cpm" | "elapsedMs">) {
  return Number.isFinite(input.elapsedMs) && input.elapsedMs >= MIN_ELAPSED_MS && input.cpm <= MAX_CPM;
}

export function buildRankingEntry(input: RankingInput): RankingEntry {
  const nickname = input.nickname.trim();
  if (nickname.length < 1 || nickname.length > 20) {
    throw new Error("닉네임은 1자 이상 20자 이하로 입력해야 합니다.");
  }
  if (input.language !== "ko" && input.language !== "en") {
    throw new Error("지원하지 않는 연습 언어입니다.");
  }
  if (!Number.isFinite(input.cpm) || input.cpm <= 0) {
    throw new Error("타수는 0보다 커야 합니다.");
  }
  if (!Number.isFinite(input.accuracy) || input.accuracy < 80 || input.accuracy > 100) {
    throw new Error("정확도 80 이상만 랭킹에 등록할 수 있습니다.");
  }
  if (input.practiceMode !== "short" && input.practiceMode !== "long") {
    throw new Error("지원하지 않는 연습 유형입니다.");
  }
  if (!hasValidPracticeScope(input)) {
    throw new Error(
      input.practiceMode === "short"
        ? "짧은 문장 랭킹은 5개 문장 완료 기록만 등록할 수 있습니다."
        : "장문 랭킹은 1개 문단 완료 기록만 등록할 수 있습니다."
    );
  }
  if (!hasPlausibleScore(input)) {
    throw new Error("비정상적으로 빠른 기록은 랭킹에 등록할 수 없습니다.");
  }

  const profile = findPokemonProfile(input.pokemonId);
  if (!profile) {
    throw new Error("선택한 포켓몬 프로필을 찾을 수 없습니다.");
  }

  return {
    ...input,
    nickname,
    pokemonName: profile.nameKo,
    pokemonImageUrl: profile.imageUrl,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
}

export function isRankingEntryValid(entry: RankingEntry): boolean {
  const hasKnownPracticeMode = entry.practiceMode === "short" || entry.practiceMode === "long";

  return (
    entry.nickname.trim().length >= 1 &&
    entry.nickname.trim().length <= 20 &&
    (entry.language === "ko" || entry.language === "en") &&
    Number.isFinite(entry.cpm) &&
    entry.cpm > 0 &&
    Number.isFinite(entry.accuracy) &&
    entry.accuracy >= 80 &&
    entry.accuracy <= 100 &&
    hasPlausibleScore(entry) &&
    Boolean(findPokemonProfile(entry.pokemonId)) &&
    (!hasKnownPracticeMode || hasValidPracticeScope(entry))
  );
}

export function sortRankings(entries: RankingEntry[]): RankingEntry[] {
  return [...entries].sort((a, b) => b.cpm - a.cpm || b.accuracy - a.accuracy || a.elapsedMs - b.elapsedMs);
}
