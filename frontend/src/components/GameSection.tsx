import { type DataPoint, type Game } from "../types";
import GameCard from "./GameCard";
import GameChart from "./GameChart";

export default function GameSection({
  game,
  index,
  dataPoints,
}: {
  game: Game;
  index: number;
  dataPoints: DataPoint[];
}) {
  const latestPlayerCount =
    dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].players : 0;

  return (
    <div key={game.name + "Container"} className="flex flex-col sm:flex-row items-center">
      <GameCard
        key={game.name + "Card"}
        game={game}
        chartIndex={index}
        latest={latestPlayerCount}
      />
      <GameChart
        key={game.name + "Graph"}
        dataPoints={dataPoints}
        index={index - 1}
      />
    </div>
  );
}
