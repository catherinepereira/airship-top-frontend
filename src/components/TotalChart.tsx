import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type Game } from "../types";
import { CHART_COLORS } from "../Util";

export default function TotalChart({
  games,
  totalDataPoints,
}: {
  games: Game[];
  totalDataPoints: Record<string, number>[] | undefined;
}) {
  /** Store game names to fetch by id */
  const gameNameMemo = useMemo(() => {
    const map = new Map<string, string>();
    for (const game of games) {
      map.set(game.gameId, game.name);
    }
    return map;
  }, [games]);

  return (
    <div className="mt-10">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={totalDataPoints}>
          <YAxis
            tickCount={3}
            interval={"preserveStartEnd"}
            axisLine={false}
            allowDecimals={false}
          />
          <XAxis
            dataKey={"timestamp"}
            tick={true}
            tickCount={20}
            tickFormatter={(time) =>
              new Date(time).toLocaleTimeString(undefined, {
                month: undefined,
                day: undefined,
                hour: "numeric",
                minute: "numeric",
                second: undefined,
              })
            }
          />
          <Tooltip
            cursor={{
              stroke: "gray",
              strokeWidth: 1,
              strokeDasharray: 4,
            }}
            separator=": "
            contentStyle={{
              backgroundColor: "rgba(57, 58, 60, 1)",
              border: 0,
              borderRadius: 3,
            }}
            wrapperStyle={{
              zIndex: 10,
            }}
            itemSorter={(item) => -(item.value as number)}
            formatter={(value, name) => {
              const displayName =
                name === "Total"
                  ? "Total Players"
                  : gameNameMemo.get(name as string) ?? name;
              return [value, displayName];
            }}
            labelFormatter={(date) =>
              new Date(date).toLocaleTimeString(undefined, {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
                hour: "numeric",
                minute: "numeric",
                second: undefined,
              })
            }
          />
          {/* TOTAL LINE */}
          {/* <Line
						type={"monotone"}
						dataKey={"Total"}
						stroke="#ff6200"
						strokeWidth={2}
						dot={false}
					/> */}
          {games.map((game, index) => (
            <Line
              type={"monotone"}
              key={game.name}
              label={game.name}
              dataKey={game.gameId}
              stroke={CHART_COLORS[index]}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
