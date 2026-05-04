import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type DataPoint } from "../types";
import { CHART_COLORS } from "../Util";

export default function GameChart({
  dataPoints,
  index,
}: {
  dataPoints: DataPoint[];
  index: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={dataPoints} syncId={"gameCharts"} syncMethod={"value"}>
        <YAxis
          tickCount={3}
          interval={"preserveStartEnd"}
          axisLine={false}
          allowDecimals={false}
        />
        <XAxis
          dataKey={"timestamp"}
          tick={false}
          tickFormatter={(time) =>
            new Date(time).toLocaleTimeString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: undefined,
              timeZone: undefined,
              weekday: undefined,
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
          formatter={(value) => {
            const displayName = "Players";
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
              timeZone: undefined,
            })
          }
        />
        <Line
          type={"monotone"}
          dataKey={"players"}
          stroke={CHART_COLORS[index]}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
