import { kv } from "@vercel/kv";
import type { PracticeLanguage } from "./practiceTexts";
import type { RankingEntry } from "./rankings";
import { sortRankings } from "./rankings";

const keyFor = (language: PracticeLanguage) => `rankings:${language}`;

export async function getRankings(language: PracticeLanguage): Promise<RankingEntry[]> {
  const entries = await kv.get<RankingEntry[]>(keyFor(language));
  return sortRankings(entries ?? []).slice(0, 10);
}

export async function saveRanking(entry: RankingEntry): Promise<RankingEntry[]> {
  const key = keyFor(entry.language);
  const existing = await kv.get<RankingEntry[]>(key);
  const next = sortRankings([...(existing ?? []), entry]).slice(0, 10);
  await kv.set(key, next);
  return next;
}
