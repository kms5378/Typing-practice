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
