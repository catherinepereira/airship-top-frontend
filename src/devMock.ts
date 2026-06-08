import rawGames from "./mockGames.json";
import type { Game } from "./types";

// Dev-only fetch mock for running the UI without the backend

// CDN image keys per game, appended to the cdn.airship.gg base in GameCard
const ICONS: Record<string, string> = {
  "bedwars-2": "bedwars",
  "gg-farm": "ggfarm",
  "catch-a-fish": "056e0481-e614-4e70-a2fc-7bb63a64bb9a",
};

const games: Game[] = (rawGames as Game[]).map((g) => ({
  ...g,
  icon: ICONS[g.gameId] ?? "",
}));

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export function installDevMock() {
  const onlinePlayers = games.reduce((sum, g) => sum + g.players, 0) + 20;
  const realFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("/player-count/games")) {
      return Promise.resolve(jsonResponse(games));
    }
    if (url.includes("/player-count/platform-stats")) {
      return Promise.resolve(jsonResponse({ onlinePlayers }));
    }
    return realFetch(input, init);
  };

  console.info("[devMock] VITE_API_URL unset, serving dummy player-count data");
}
