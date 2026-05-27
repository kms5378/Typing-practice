"use client";

import { useMemo, useState } from "react";
import { pokemonProfiles } from "@/lib/pokemonProfiles";
import {
  getRandomPracticeSet,
  longPracticeTexts,
  practiceTexts,
  SHORT_SESSION_SENTENCE_COUNT,
  type PracticeLanguage,
  type PracticeMode
} from "@/lib/practiceTexts";
import type { RankingEntry } from "@/lib/rankings";
import { calculateAccuracy, calculateCpm, countCorrectCharacters } from "@/lib/typingMetrics";

type Phase = "setup" | "practice" | "result";

export default function TypingPracticeApp() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [nickname, setNickname] = useState("");
  const [pokemonId, setPokemonId] = useState(25);
  const [language, setLanguage] = useState<PracticeLanguage>("ko");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("short");
  const [longTextId, setLongTextId] = useState("moon-road");
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [typedHistory, setTypedHistory] = useState<string[]>([]);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [rankingMessage, setRankingMessage] = useState("");
  const [resultHistory, setResultHistory] = useState<string[]>([]);
  const [isSubmittingRanking, setIsSubmittingRanking] = useState(false);
  const [shortSessionSentences, setShortSessionSentences] = useState<string[]>([]);

  const profile = pokemonProfiles.find((item) => item.id === pokemonId) ?? pokemonProfiles[0];
  const longText = longPracticeTexts[language].find((item) => item.id === longTextId) ?? longPracticeTexts[language][0];
  const activeShortSentences =
    shortSessionSentences.length > 0
      ? shortSessionSentences
      : practiceTexts[language].slice(0, SHORT_SESSION_SENTENCE_COUNT);
  const sentences = practiceMode === "short" ? activeShortSentences : [longText.text];
  const expectedText = sentences.join("");
  const actualText = [...typedHistory, typed].join("");
  const correctCharacters = countCorrectCharacters(expectedText, actualText);
  const elapsedMs = startedAt ? (finishedAt ?? Date.now()) - startedAt : 0;
  const accuracy = calculateAccuracy(expectedText, actualText);
  const cpm = calculateCpm(correctCharacters, elapsedMs);
  const currentSentence = sentences[sentenceIndex];

  const progress = useMemo(
    () => Math.round((sentenceIndex / sentences.length) * 100),
    [sentenceIndex, sentences.length]
  );

  function startPractice() {
    if (!nickname.trim()) return;
    setShortSessionSentences(
      practiceMode === "short" ? getRandomPracticeSet(practiceTexts[language], SHORT_SESSION_SENTENCE_COUNT) : []
    );
    setPhase("practice");
    setSentenceIndex(0);
    setTyped("");
    setTypedHistory([]);
    setStartedAt(Date.now());
    setFinishedAt(null);
    setRankings([]);
    setRankingMessage("");
    setResultHistory([]);
    setIsSubmittingRanking(false);
  }

  function resetToSetup() {
    setPhase("setup");
    setSentenceIndex(0);
    setTyped("");
    setTypedHistory([]);
    setStartedAt(null);
    setFinishedAt(null);
    setRankings([]);
    setRankingMessage("");
    setResultHistory([]);
    setIsSubmittingRanking(false);
    setShortSessionSentences([]);
  }

  function selectLanguage(nextLanguage: PracticeLanguage) {
    setLanguage(nextLanguage);
    setLongTextId(longPracticeTexts[nextLanguage][0].id);
    setShortSessionSentences([]);
  }

  function finishPractice(nextHistory: string[]) {
    setFinishedAt(Date.now());
    setResultHistory(nextHistory);
    setPhase("result");
    setRankingMessage("");
  }

  async function submitRanking() {
    const finalExpected = sentences.join("");
    const finalTyped = resultHistory.join("");
    const finalCorrect = countCorrectCharacters(finalExpected, finalTyped);
    const finalElapsed = startedAt && finishedAt ? finishedAt - startedAt : 0;
    const finalAccuracy = calculateAccuracy(finalExpected, finalTyped);
    const finalCpm = calculateCpm(finalCorrect, finalElapsed);

    if (finalAccuracy < 80) {
      setRankingMessage("정확도 80 이상만 랭킹에 등록됩니다.");
      return;
    }

    setIsSubmittingRanking(true);
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
    } finally {
      setIsSubmittingRanking(false);
    }
  }

  function handleTyped(value: string) {
    setTyped(value);
    if (value === currentSentence) {
      const nextHistory = [...typedHistory, value];
      setTypedHistory(nextHistory);
      setTyped("");
      if (sentenceIndex === sentences.length - 1) {
        finishPractice(nextHistory);
      } else {
        setSentenceIndex((index) => index + 1);
      }
    }
  }

  function renderPrompt(text: string, input: string) {
    const typedChars = Array.from(input);
    return Array.from(text).map((char, index) => {
      const isIncorrect = typedChars[index] !== undefined && typedChars[index] !== char;
      return (
        <span className={isIncorrect ? "incorrect-char" : undefined} key={`${char}-${index}`}>
          {char}
        </span>
      );
    });
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
            <button className={language === "ko" ? "selected" : ""} onClick={() => selectLanguage("ko")}>
              한글
            </button>
            <button className={language === "en" ? "selected" : ""} onClick={() => selectLanguage("en")}>
              English
            </button>
          </div>

          <div className="mode-row practice-type-row" aria-label="연습 유형 선택">
            <button className={practiceMode === "short" ? "selected" : ""} onClick={() => setPracticeMode("short")}>
              짧은 문장
            </button>
            <button className={practiceMode === "long" ? "selected" : ""} onClick={() => setPracticeMode("long")}>
              장문
            </button>
          </div>

          {practiceMode === "long" ? (
            <div className="passage-grid">
              {longPracticeTexts[language].map((passage) => (
                <button
                  key={passage.id}
                  className={`passage-card ${passage.id === longText.id ? "selected" : ""}`}
                  onClick={() => setLongTextId(passage.id)}
                  aria-label={`${passage.title} 선택`}
                >
                  <strong>{passage.title}</strong>
                  <span>{passage.source}</span>
                  <p>{passage.text}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="practice-count">
              짧은 문장 {practiceTexts[language].length}개 중 랜덤 {SHORT_SESSION_SENTENCE_COUNT}개를 입력합니다.
            </p>
          )}

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

          <button className="primary-action" onClick={startPractice} disabled={!nickname.trim()}>
            연습 시작
          </button>
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
          <div className="practice-actions">
            <div className="stats">
              <span>진행률 {progress}%</span>
              <span>정확도 {accuracy}%</span>
              <span>타수 {cpm}</span>
            </div>
            <button className="secondary-action" onClick={resetToSetup}>
              처음으로
            </button>
          </div>
        </header>

        {phase === "practice" ? (
          <div className="typing-area">
            <p className="sentence" data-testid="current-prompt">
              {renderPrompt(currentSentence, typed)}
            </p>
            <textarea aria-label="입력" value={typed} onChange={(event) => handleTyped(event.target.value)} autoFocus />
          </div>
        ) : (
          <div className="result-area">
            <h2>연습 완료</h2>
            <p>
              최종 타수 {cpm} / 정확도 {accuracy}%
            </p>
            <p>{rankingMessage}</p>
            <button
              className="primary-action"
              disabled={accuracy < 80 || isSubmittingRanking || rankingMessage === "랭킹에 등록되었습니다."}
              onClick={() => void submitRanking()}
            >
              {isSubmittingRanking ? "등록 중" : "랭킹 등록"}
            </button>
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
            <button className="primary-action" onClick={startPractice}>
              다시 연습
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
