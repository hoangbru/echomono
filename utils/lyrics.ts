export interface LyricLine {
  time: number;
  text: string;
}

export function parseLRC(lrcText: string): LyricLine[] {
  if (!lrcText) return [];

  const lines = lrcText.split("\n");
  const parsedLyrics: LyricLine[] = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  lines.forEach((line) => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3], 10);

      const timeInSeconds =
        minutes * 60 +
        seconds +
        milliseconds / (match[3].length === 3 ? 1000 : 100);

      const text = line.replace(timeRegex, "").trim();

      if (text) {
        parsedLyrics.push({ time: timeInSeconds, text });
      }
    }
  });

  return parsedLyrics;
}

/**
 * Remove LRC timestamps from lyrics, keeping only text content.
 */
export function stripLrcTimestamps(lyrics: string): string {
  return lyrics
    .split("\n")
    .map((line) => line.replace(/^\[\d{2}:\d{2}[.:]\d{2,3}\]\s?/, "").trim())
    .filter(Boolean)
    .join("\n");
}

/**
 * Check whether a lyrics string uses LRC format.
 */
export function isLrcFormat(lyrics: string): boolean {
  return /^\[\d{2}:\d{2}[.:]\d{2,3}\]/.test(lyrics.trimStart());
}
