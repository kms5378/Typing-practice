import { findPokemonProfile } from "./pokemonProfiles";
import type { PracticeLanguage } from "./practiceTexts";

export type RankingInput = {
  nickname: string;
  pokemonId: number;
  language: PracticeLanguage;
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

export function sortRankings(entries: RankingEntry[]): RankingEntry[] {
  return [...entries].sort((a, b) => b.cpm - a.cpm || b.accuracy - a.accuracy || a.elapsedMs - b.elapsedMs);
}
