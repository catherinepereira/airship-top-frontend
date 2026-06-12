import type { Game } from "./types";

export const CHART_COLORS = [
  "#FF595E", // red
  "#FF924C", // red-orange
  "#FFCA3A", // yellow
  "#C5CA30", // lime
  "#8AC926", // green
  "#36949D", // turquoise
  "#1982C4", // blue
  "#4267AC", // navy blue
  "#6A4C93", // violet
  "#B55379", // indigo
];

export async function Util_fetchGames(): Promise<Game[]> {
  try {
    const [gamesRes] = await Promise.all([fetch(`${import.meta.env.VITE_API_URL}/player-count/games`)]);
    const gamesData = (await gamesRes.json()) as Game[];
    const gamesWithCounts = gamesData.filter(
      (g) => g.playerCounts.length !== 0
    );
    return Array.from(new Set(gamesWithCounts));
  } catch (err) {
    console.error("Error fetching games data:", err);
    return [];
  }
}

export type TimestampMergedData = {
  timestamp: number;
  Total: number;
} & Record<string, number>;

export async function Util_mergeTotalGameHistory(
  games: Game[]
): Promise<TimestampMergedData[]> {
  /** Get game history for all specified games */
  const gameHistoryMap = new Map();
  games.forEach((g) => gameHistoryMap.set(g, g.playerCounts));
  if (gameHistoryMap.size === 0) {
    return [];
  }

  /** Merge all game history together into the desired format */
  const mergedMap = new Map<number, TimestampMergedData>();

  for (const [game, dataPoints] of gameHistoryMap) {
    for (const { timestamp, players } of dataPoints) {
      const numericTimestamp = new Date(timestamp).getTime();

      if (!mergedMap.has(numericTimestamp)) {
        const starterEntry: TimestampMergedData = {
          timestamp: numericTimestamp,
          Total: 0,
        };
        mergedMap.set(numericTimestamp, starterEntry);
      }

      const entry = mergedMap.get(numericTimestamp)!;

      entry[game.gameId] = players;
      entry.Total += players;
    }
  }

  const mergedArray = Array.from(mergedMap.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );

  return mergedArray;
}
