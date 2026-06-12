import { useEffect, useState } from "react";
import { type DataPoint, type Game } from "../types";
import GameSection from "./GameSection";

export default function GamesSection({ games }: { games: Game[] }) {
  const [allPlayersMap, setAllPlayersMap] = useState<Map<Game, DataPoint[]>>(
    new Map()
  );
  const [sortedGames, setSortedGames] = useState<Game[]>([]);

  useEffect(() => {
    function sortGames(updatedMap: Map<Game, DataPoint[]>) {
      setSortedGames(
        games.sort((a, b) => {
          const playersBMap = updatedMap.get(b);
          const playersAMap = updatedMap.get(a);

          if (playersAMap && playersBMap) {
            const latestPlayersB = playersBMap[playersBMap.length - 1];
            const latestPlayersA = playersAMap[playersAMap.length - 1];
            return latestPlayersB.players - latestPlayersA.players;
          } else {
            return b.players - a.players;
          }
        })
      );
    }

    const allPlayersMap = new Map();
    games.forEach((game) => {
      allPlayersMap.set(game, game.playerCounts);
    });

    setAllPlayersMap(allPlayersMap);
    sortGames(allPlayersMap);
  }, [games]);

  useEffect(() => {}, [sortedGames]);

  return (
    <div className="w-5/6 mx-auto flex flex-col gap-10">
      {sortedGames.length === 0 ? (
        <></>
      ) : (
        sortedGames.map((game, i) => (
          <GameSection
            game={game}
            index={i + 1}
            dataPoints={allPlayersMap.get(game) ?? []}
          />
        ))
      )}
    </div>
  );
}
