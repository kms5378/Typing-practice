import { NextRequest, NextResponse } from "next/server";
import { getRankings, saveRanking } from "@/lib/rankingStore";
import type { PracticeLanguage } from "@/lib/practiceTexts";
import { buildRankingEntry } from "@/lib/rankings";

function parseLanguage(value: string | null): PracticeLanguage {
  if (value === "ko" || value === "en") return value;
  return "ko";
}

export async function GET(request: NextRequest) {
  const language = parseLanguage(request.nextUrl.searchParams.get("language"));
  const rankings = await getRankings(language);
  return NextResponse.json({ rankings });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const entry = buildRankingEntry(payload);
    const rankings = await saveRanking(entry);
    return NextResponse.json({ entry, rankings }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "랭킹 저장에 실패했습니다." },
      { status: 400 }
    );
  }
}
