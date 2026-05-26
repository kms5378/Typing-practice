# Typing Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a Korean/English typing practice web app with Pokemon profile selection and shared Vercel KV rankings.

**Architecture:** Use a Next.js App Router application. Keep pure typing calculations and static content in small `src/lib` modules, expose rankings through `/api/rankings`, and render the main practice flow from a client component. Vercel KV is the production ranking store, with a deterministic in-memory fallback for local tests only.

**Tech Stack:** Next.js, React, TypeScript, Vitest, Testing Library, Playwright, Vercel KV.

---

## File Structure

- `package.json`: scripts and dependencies.
- `next.config.mjs`: Next.js config.
- `tsconfig.json`: TypeScript config.
- `vitest.config.ts`: Vitest config.
- `playwright.config.ts`: Playwright config.
- `src/app/layout.tsx`: global app shell metadata.
- `src/app/page.tsx`: home route rendering the typing app.
- `src/app/globals.css`: application styling.
- `src/app/api/rankings/route.ts`: ranking API.
- `src/components/TypingPracticeApp.tsx`: profile selection, typing flow, result, ranking UI.
- `src/lib/pokemonProfiles.ts`: extendable Pokemon profile list.
- `src/lib/practiceTexts.ts`: Korean and English sentence sets.
- `src/lib/typingMetrics.ts`: CPM and accuracy calculation.
- `src/lib/rankings.ts`: validation and ranking store helpers.
- `src/lib/rankingStore.ts`: Vercel KV access wrapper.
- `src/lib/__tests__/typingMetrics.test.ts`: metric unit tests.
- `src/lib/__tests__/rankings.test.ts`: ranking validation tests.
- `src/components/__tests__/TypingPracticeApp.test.tsx`: component flow tests.
- `e2e/typing-flow.spec.ts`: end-to-end smoke flow.
- `.env.example`: documents required Vercel KV variables.
- `README.md`: setup, local development, Vercel deployment.

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Create the project config files**

Create `package.json`:

```json
{
  "name": "typing-practice",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  },
  "dependencies": {
    "@vercel/kv": "^3.0.0",
    "next": "^15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^22.15.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.4.0",
    "eslint": "^9.26.0",
    "eslint-config-next": "^15.3.0",
    "typescript": "^5.8.0",
    "vitest": "^3.1.0"
  }
}
```

Create `next.config.mjs`:

```js
const nextConfig = {};

export default nextConfig;
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["@testing-library/jest-dom/vitest"]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } }
  ]
});
```

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "한/영 타자 연습",
  description: "포켓몬 프로필로 즐기는 한글과 영어 타자 연습"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:

```tsx
export default function Home() {
  return <main>Typing Practice</main>;
}
```

Create `src/app/globals.css`:

```css
:root {
  color-scheme: light;
  --bg: #f6f7fb;
  --panel: #ffffff;
  --ink: #172033;
  --muted: #667085;
  --line: #d8deea;
  --primary: #1d6fdc;
  --primary-ink: #ffffff;
  --danger: #c73636;
  --success: #16794c;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Arial, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
}

button,
input,
textarea {
  font: inherit;
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and dependencies install without errors.

- [ ] **Step 3: Verify the scaffold builds**

Run: `npm run build`

Expected: `Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json next.config.mjs tsconfig.json vitest.config.ts playwright.config.ts src/app/layout.tsx src/app/page.tsx src/app/globals.css
git commit -m "chore: scaffold next app"
```

## Task 2: Typing Metrics

**Files:**
- Create: `src/lib/typingMetrics.ts`
- Test: `src/lib/__tests__/typingMetrics.test.ts`

- [ ] **Step 1: Write the failing metric tests**

Create `src/lib/__tests__/typingMetrics.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/typingMetrics.test.ts`

Expected: FAIL because `../typingMetrics` does not exist.

- [ ] **Step 3: Implement metrics**

Create `src/lib/typingMetrics.ts`:

```ts
export function countCorrectCharacters(expected: string, typed: string): number {
  const expectedChars = Array.from(expected);
  const typedChars = Array.from(typed);

  return expectedChars.reduce((count, char, index) => {
    return count + (typedChars[index] === char ? 1 : 0);
  }, 0);
}

export function calculateAccuracy(expected: string, typed: string): number {
  const total = Array.from(expected).length;
  if (total === 0) return 100;

  return Math.round((countCorrectCharacters(expected, typed) / total) * 100);
}

export function calculateCpm(correctCharacters: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;

  const minutes = elapsedMs / 60_000;
  return Math.round(correctCharacters / minutes);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/typingMetrics.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/typingMetrics.ts src/lib/__tests__/typingMetrics.test.ts
git commit -m "feat: add typing metrics"
```

## Task 3: Static Practice Content and Profiles

**Files:**
- Create: `src/lib/pokemonProfiles.ts`
- Create: `src/lib/practiceTexts.ts`

- [ ] **Step 1: Create profile and text data**

Create `src/lib/pokemonProfiles.ts`:

```ts
export type PokemonProfile = {
  id: number;
  nameKo: string;
  nameEn: string;
  imageUrl: string;
  accentColor: string;
};

const sprite = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const pokemonProfiles: PokemonProfile[] = [
  { id: 25, nameKo: "피카츄", nameEn: "Pikachu", imageUrl: sprite(25), accentColor: "#f2c94c" },
  { id: 1, nameKo: "이상해씨", nameEn: "Bulbasaur", imageUrl: sprite(1), accentColor: "#27ae60" },
  { id: 4, nameKo: "파이리", nameEn: "Charmander", imageUrl: sprite(4), accentColor: "#eb5757" },
  { id: 7, nameKo: "꼬부기", nameEn: "Squirtle", imageUrl: sprite(7), accentColor: "#2f80ed" },
  { id: 39, nameKo: "푸린", nameEn: "Jigglypuff", imageUrl: sprite(39), accentColor: "#f299c1" },
  { id: 52, nameKo: "나옹", nameEn: "Meowth", imageUrl: sprite(52), accentColor: "#d6a45d" },
  { id: 54, nameKo: "고라파덕", nameEn: "Psyduck", imageUrl: sprite(54), accentColor: "#f2c94c" },
  { id: 133, nameKo: "이브이", nameEn: "Eevee", imageUrl: sprite(133), accentColor: "#a97142" },
  { id: 143, nameKo: "잠만보", nameEn: "Snorlax", imageUrl: sprite(143), accentColor: "#486581" },
  { id: 152, nameKo: "치코리타", nameEn: "Chikorita", imageUrl: sprite(152), accentColor: "#6fcf97" },
  { id: 155, nameKo: "브케인", nameEn: "Cyndaquil", imageUrl: sprite(155), accentColor: "#f2994a" },
  { id: 158, nameKo: "리아코", nameEn: "Totodile", imageUrl: sprite(158), accentColor: "#56ccf2" }
];

export function findPokemonProfile(id: number) {
  return pokemonProfiles.find((profile) => profile.id === id);
}
```

Create `src/lib/practiceTexts.ts`:

```ts
export type PracticeLanguage = "ko" | "en";

export const practiceTexts: Record<PracticeLanguage, string[]> = {
  ko: [
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
  ],
  en: [
    "Start slowly and keep every letter accurate.",
    "Typing practice improves with steady focus.",
    "Read the sentence before moving your fingers.",
    "Small mistakes are easier to fix right away.",
    "Speed comes after accuracy and rhythm.",
    "Keep your hands relaxed while you type.",
    "Finish each sentence before checking the score.",
    "Practice a little every day to build confidence.",
    "Clear feedback helps you improve faster.",
    "Complete the final sentence with care."
  ]
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/pokemonProfiles.ts src/lib/practiceTexts.ts
git commit -m "feat: add practice content"
```

## Task 4: Ranking Validation and Store

**Files:**
- Create: `src/lib/rankings.ts`
- Create: `src/lib/rankingStore.ts`
- Test: `src/lib/__tests__/rankings.test.ts`

- [ ] **Step 1: Write the failing ranking validation tests**

Create `src/lib/__tests__/rankings.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildRankingEntry, sortRankings } from "../rankings";

describe("rankings", () => {
  it("builds a validated ranking entry", () => {
    const entry = buildRankingEntry({
      nickname: "Ash",
      pokemonId: 25,
      language: "ko",
      cpm: 320,
      accuracy: 96,
      elapsedMs: 45_000,
      completedSentences: 10
    });

    expect(entry.nickname).toBe("Ash");
    expect(entry.pokemonName).toBe("피카츄");
    expect(entry.pokemonImageUrl).toContain("/25.png");
  });

  it("rejects low accuracy ranking entries", () => {
    expect(() =>
      buildRankingEntry({
        nickname: "Ash",
        pokemonId: 25,
        language: "en",
        cpm: 500,
        accuracy: 70,
        elapsedMs: 20_000,
        completedSentences: 10
      })
    ).toThrow("정확도 80 이상만 랭킹에 등록할 수 있습니다.");
  });

  it("sorts rankings by cpm then accuracy", () => {
    const entries = [
      buildRankingEntry({ nickname: "A", pokemonId: 1, language: "ko", cpm: 250, accuracy: 99, elapsedMs: 50_000, completedSentences: 10 }),
      buildRankingEntry({ nickname: "B", pokemonId: 4, language: "ko", cpm: 280, accuracy: 90, elapsedMs: 50_000, completedSentences: 10 }),
      buildRankingEntry({ nickname: "C", pokemonId: 7, language: "ko", cpm: 280, accuracy: 95, elapsedMs: 50_000, completedSentences: 10 })
    ];

    expect(sortRankings(entries).map((entry) => entry.nickname)).toEqual(["C", "B", "A"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/rankings.test.ts`

Expected: FAIL because `../rankings` does not exist.

- [ ] **Step 3: Implement ranking helpers**

Create `src/lib/rankings.ts`:

```ts
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
```

Create `src/lib/rankingStore.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/rankings.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rankings.ts src/lib/rankingStore.ts src/lib/__tests__/rankings.test.ts
git commit -m "feat: add ranking helpers"
```

## Task 5: Ranking API

**Files:**
- Create: `src/app/api/rankings/route.ts`

- [ ] **Step 1: Implement API route**

Create `src/app/api/rankings/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getRankings, saveRanking } from "@/lib/rankingStore";
import { buildRankingEntry } from "@/lib/rankings";
import type { PracticeLanguage } from "@/lib/practiceTexts";

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
```

- [ ] **Step 2: Build check**

Run: `npm run build`

Expected: build succeeds. If local KV variables are absent and the build imports `@vercel/kv` without runtime access, build still succeeds because no request is executed.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/rankings/route.ts
git commit -m "feat: add rankings api"
```

## Task 6: Typing Practice UI

**Files:**
- Create: `src/components/TypingPracticeApp.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/__tests__/TypingPracticeApp.test.tsx`

- [ ] **Step 1: Write failing component tests**

Create `src/components/__tests__/TypingPracticeApp.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TypingPracticeApp from "../TypingPracticeApp";

describe("TypingPracticeApp", () => {
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

  it("shows result after completing all sentences", () => {
    vi.useFakeTimers();
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
      vi.advanceTimersByTime(3_000);
    }

    expect(screen.getByText("연습 완료")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/__tests__/TypingPracticeApp.test.tsx`

Expected: FAIL because `TypingPracticeApp` does not exist.

- [ ] **Step 3: Implement the client component**

Create `src/components/TypingPracticeApp.tsx` with a client component that:

```tsx
"use client";

import { useMemo, useState } from "react";
import { pokemonProfiles } from "@/lib/pokemonProfiles";
import { practiceTexts, type PracticeLanguage } from "@/lib/practiceTexts";
import { calculateAccuracy, calculateCpm, countCorrectCharacters } from "@/lib/typingMetrics";
import type { RankingEntry } from "@/lib/rankings";

type Phase = "setup" | "practice" | "result";

export default function TypingPracticeApp() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [nickname, setNickname] = useState("");
  const [pokemonId, setPokemonId] = useState(25);
  const [language, setLanguage] = useState<PracticeLanguage>("ko");
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [typedHistory, setTypedHistory] = useState<string[]>([]);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [rankingMessage, setRankingMessage] = useState("");

  const profile = pokemonProfiles.find((item) => item.id === pokemonId) ?? pokemonProfiles[0];
  const sentences = practiceTexts[language];
  const expectedText = sentences.join("");
  const actualText = [...typedHistory, typed].join("");
  const correctCharacters = countCorrectCharacters(expectedText, actualText);
  const elapsedMs = startedAt ? (finishedAt ?? Date.now()) - startedAt : 0;
  const accuracy = calculateAccuracy(expectedText, actualText);
  const cpm = calculateCpm(correctCharacters, elapsedMs);
  const currentSentence = sentences[sentenceIndex];

  const progress = useMemo(() => Math.round((sentenceIndex / sentences.length) * 100), [sentenceIndex, sentences.length]);

  function startPractice() {
    if (!nickname.trim()) return;
    setPhase("practice");
    setSentenceIndex(0);
    setTyped("");
    setTypedHistory([]);
    setStartedAt(Date.now());
    setFinishedAt(null);
    setRankingMessage("");
  }

  async function finishPractice(nextHistory: string[]) {
    const end = Date.now();
    setFinishedAt(end);
    setPhase("result");

    const finalExpected = sentences.join("");
    const finalTyped = nextHistory.join("");
    const finalCorrect = countCorrectCharacters(finalExpected, finalTyped);
    const finalElapsed = startedAt ? end - startedAt : 0;
    const finalAccuracy = calculateAccuracy(finalExpected, finalTyped);
    const finalCpm = calculateCpm(finalCorrect, finalElapsed);

    if (finalAccuracy < 80) {
      setRankingMessage("정확도 80 이상만 랭킹에 등록됩니다.");
      return;
    }

    try {
      const response = await fetch("/api/rankings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          pokemonId,
          language,
          cpm: finalCpm,
          accuracy: finalAccuracy,
          elapsedMs: finalElapsed,
          completedSentences: sentences.length
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setRankings(data.rankings);
      setRankingMessage("랭킹에 등록되었습니다.");
    } catch {
      setRankingMessage("랭킹 저장에 실패했습니다. Vercel KV 설정을 확인하세요.");
    }
  }

  function handleTyped(value: string) {
    setTyped(value);
    if (value === currentSentence) {
      const nextHistory = [...typedHistory, value];
      setTypedHistory(nextHistory);
      setTyped("");
      if (sentenceIndex === sentences.length - 1) {
        void finishPractice(nextHistory);
      } else {
        setSentenceIndex((index) => index + 1);
      }
    }
  }

  if (phase === "setup") {
    return (
      <main className="app-shell">
        <section className="setup-panel">
          <div>
            <p className="eyebrow">Pokemon Typing Practice</p>
            <h1>한/영 타자 연습</h1>
            <p className="lede">포켓몬 프로필을 고르고 문장 세트를 끝까지 입력해 랭킹에 도전하세요.</p>
          </div>

          <label className="field">
            <span>닉네임</span>
            <input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={20} />
          </label>

          <div className="mode-row" aria-label="언어 선택">
            <button className={language === "ko" ? "selected" : ""} onClick={() => setLanguage("ko")}>한글</button>
            <button className={language === "en" ? "selected" : ""} onClick={() => setLanguage("en")}>English</button>
          </div>

          <div className="profile-grid">
            {pokemonProfiles.map((pokemon) => (
              <button
                key={pokemon.id}
                className={`profile-card ${pokemon.id === pokemonId ? "selected" : ""}`}
                onClick={() => setPokemonId(pokemon.id)}
                aria-label={`${pokemon.nameKo} 선택`}
                style={{ "--accent": pokemon.accentColor } as React.CSSProperties}
              >
                <img src={pokemon.imageUrl} alt="" />
                <span>{pokemon.nameKo}</span>
              </button>
            ))}
          </div>

          <button className="primary-action" onClick={startPractice} disabled={!nickname.trim()}>연습 시작</button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="practice-panel">
        <header className="practice-header">
          <div className="trainer">
            <img src={profile.imageUrl} alt="" />
            <div>
              <strong>{nickname}</strong>
              <span>{profile.nameKo}</span>
            </div>
          </div>
          <div className="stats">
            <span>진행률 {progress}%</span>
            <span>정확도 {accuracy}%</span>
            <span>타수 {cpm}</span>
          </div>
        </header>

        {phase === "practice" ? (
          <div className="typing-area">
            <p className="sentence">{currentSentence}</p>
            <textarea aria-label="입력" value={typed} onChange={(event) => handleTyped(event.target.value)} autoFocus />
          </div>
        ) : (
          <div className="result-area">
            <h2>연습 완료</h2>
            <p>최종 타수 {cpm} / 정확도 {accuracy}%</p>
            <p>{rankingMessage}</p>
            <h3>랭킹 Top 10</h3>
            <ol className="ranking-list">
              {rankings.map((entry) => (
                <li key={entry.id}>
                  <img src={entry.pokemonImageUrl} alt="" />
                  <span>{entry.nickname}</span>
                  <strong>{entry.cpm}타</strong>
                  <span>{entry.accuracy}%</span>
                </li>
              ))}
            </ol>
            <button className="primary-action" onClick={startPractice}>다시 연습</button>
          </div>
        )}
      </section>
    </main>
  );
}
```

Modify `src/app/page.tsx`:

```tsx
import TypingPracticeApp from "@/components/TypingPracticeApp";

export default function Home() {
  return <TypingPracticeApp />;
}
```

- [ ] **Step 4: Add CSS for the full app**

Append this CSS to `src/app/globals.css`:

```css
.app-shell {
  min-height: 100vh;
  padding: 32px;
}

.setup-panel,
.practice-panel {
  width: min(1120px, 100%);
  margin: 0 auto;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 28px;
  box-shadow: 0 18px 50px rgba(23, 32, 51, 0.08);
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--primary);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 40px;
  line-height: 1.15;
}

.lede {
  max-width: 640px;
  color: var(--muted);
  line-height: 1.6;
}

.field {
  display: grid;
  gap: 8px;
  margin: 24px 0 16px;
  font-weight: 700;
}

.field input,
.typing-area textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  background: #fff;
}

.field input {
  height: 44px;
  padding: 0 12px;
}

.mode-row {
  display: inline-grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #eef2f7;
}

.mode-row button,
.primary-action,
.profile-card {
  cursor: pointer;
}

.mode-row button {
  min-width: 110px;
  border: 0;
  border-radius: 6px;
  padding: 10px 14px;
  background: transparent;
  color: var(--muted);
  font-weight: 700;
}

.mode-row button.selected {
  background: var(--panel);
  color: var(--primary);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  gap: 12px;
  margin: 24px 0;
}

.profile-card {
  min-height: 150px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 14px;
  display: grid;
  place-items: center;
  gap: 8px;
  color: var(--ink);
  font-weight: 700;
}

.profile-card.selected {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 2px var(--accent);
}

.profile-card img {
  width: 82px;
  height: 82px;
  object-fit: contain;
}

.primary-action {
  border: 0;
  border-radius: 8px;
  background: var(--primary);
  color: var(--primary-ink);
  min-height: 46px;
  padding: 0 18px;
  font-weight: 800;
}

.primary-action:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.practice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 20px;
}

.trainer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trainer img {
  width: 58px;
  height: 58px;
  object-fit: contain;
  background: #eef2f7;
  border-radius: 8px;
}

.trainer div {
  display: grid;
  gap: 4px;
}

.trainer span,
.stats span {
  color: var(--muted);
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.stats span {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 8px 10px;
  background: #f8fafc;
  font-weight: 700;
}

.typing-area,
.result-area {
  display: grid;
  gap: 20px;
  padding-top: 28px;
}

.sentence {
  margin: 0;
  border-left: 4px solid var(--primary);
  padding: 18px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 24px;
  line-height: 1.6;
  word-break: keep-all;
}

.typing-area textarea {
  min-height: 160px;
  padding: 16px;
  resize: vertical;
  font-size: 20px;
  line-height: 1.6;
}

.result-area h2,
.result-area h3 {
  margin: 0;
}

.ranking-list {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style-position: inside;
}

.ranking-list li {
  display: grid;
  grid-template-columns: 36px 1fr auto auto;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px;
  background: #fff;
}

.ranking-list img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

@media (max-width: 720px) {
  .app-shell {
    padding: 14px;
  }

  .setup-panel,
  .practice-panel {
    padding: 18px;
  }

  h1 {
    font-size: 30px;
  }

  .practice-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .stats {
    justify-content: flex-start;
  }

  .sentence {
    font-size: 20px;
  }

  .ranking-list li {
    grid-template-columns: 32px 1fr;
  }
}
```

- [ ] **Step 5: Run component tests**

Run: `npm test -- src/components/__tests__/TypingPracticeApp.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/TypingPracticeApp.tsx src/components/__tests__/TypingPracticeApp.test.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat: build typing practice ui"
```

## Task 7: End-to-End Flow and Deployment Docs

**Files:**
- Create: `e2e/typing-flow.spec.ts`
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Write E2E test**

Create `e2e/typing-flow.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("completes the Korean typing flow", async ({ page }) => {
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
});
```

- [ ] **Step 2: Add environment example**

Create `.env.example`:

```dotenv
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
KV_URL=
```

- [ ] **Step 3: Add README**

Create `README.md`:

```md
# Typing Practice

한글과 영어 문장 세트를 입력하고, 포켓몬 프로필과 함께 Vercel KV 공용 랭킹에 기록하는 타자 연습 웹앱입니다.

## Local Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Open `http://localhost:3000`.

## Tests

\`\`\`bash
npm test
npm run e2e
\`\`\`

## Vercel Deployment

1. Push this repository to `https://github.com/kms5378/Typing-practice.git`.
2. Import the repository from Vercel.
3. Create a Vercel KV store.
4. Connect the KV store to the Vercel project so the `KV_*` environment variables are injected.
5. Deploy the `main` branch.

## Adding Pokemon Profiles

Edit `src/lib/pokemonProfiles.ts` and append a new object to `pokemonProfiles`.
\`\`\`ts
{ id: 10, nameKo: "캐터피", nameEn: "Caterpie", imageUrl: sprite(10), accentColor: "#6fcf97" }
\`\`\`
```

- [ ] **Step 4: Run verification**

Run: `npm test`

Expected: all Vitest tests pass.

Run: `npm run build`

Expected: Next.js production build succeeds.

Run: `npm run e2e`

Expected: Playwright tests pass in desktop and mobile projects.

- [ ] **Step 5: Commit**

```bash
git add e2e/typing-flow.spec.ts .env.example README.md
git commit -m "test: add typing flow verification"
```

## Task 8: Push to GitHub and Vercel Handoff

**Files:**
- No file changes expected.

- [ ] **Step 1: Check git status**

Run: `git status --short`

Expected: no uncommitted changes.

- [ ] **Step 2: Push to GitHub**

Run: `git push -u origin main`

Expected: branch `main` pushes to `https://github.com/kms5378/Typing-practice.git`.

- [ ] **Step 3: Vercel setup**

In Vercel, import `kms5378/Typing-practice`, create or attach Vercel KV, and deploy the `main` branch. Confirm the deployment URL opens the app and the ranking API can save a result.

## Self-Review

- Spec coverage: The plan covers Next.js app setup, Pokemon profile selection, Korean/English sentence sets, set-completion typing flow, CPM/accuracy calculation, Vercel KV rankings, GitHub push, Vercel deployment, and tests.
- Placeholder scan: The plan contains concrete file paths, commands, and code blocks for implementation steps.
- Type consistency: `PracticeLanguage`, `RankingInput`, `RankingEntry`, `pokemonProfiles`, `practiceTexts`, and API payload fields are used consistently across tasks.
