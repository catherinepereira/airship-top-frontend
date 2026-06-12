import { type Game } from "../types";

export default function GameCard({
  game,
  chartIndex,
  latest,
}: {
  game: Game;
  chartIndex: number;
  latest: number;
}) {
  const imageLink = "https://cdn.airship.gg/images/";

  return (
    <div className="w-5/7 overflow-hidden flex flex-col rounded-lg">
      {/* Top section - 2/3 height */}
      <div className="h-full flex flex-row p-4">
        {/* Left: Icon + buttons */}
        <div className="w-1/2 mr-4 flex flex-col items-center">
          <div className="flex justify-center">
            <img
              src={imageLink + game.icon}
              alt={game.name}
              loading="lazy"
              className="w-full h-fit aspect-video object-cover rounded-xl"
            />
          </div>
          <p className="text-xl text-white mt-4">
            #<span className="">{chartIndex}</span>
          </p>
        </div>

        {/* Right: Game info */}
        <div className="w-1/2 flex flex-col justify-top gap-1">
          <a
            href={"https://airship.gg/g/" + game.gameId}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-white text-lg"
          >
            <h2 className="text-2xl font-bold">{game.name}</h2>
          </a>

          <p className="text-lg text-white">
            Players: <span className="font-bold">{latest}</span>
          </p>
          <p className="text-lg text-white">
            24h Peak: <span className="font-medium">{game.game24hrPeak}</span>
          </p>
          <p className="text-lg text-white">
            Record: <span className="font-medium">{game.record}</span>
            <span className="font-medium">
              {" "}
              (
              {new Date(game.recordDate).toLocaleString(undefined, {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
                hour: "numeric",
                minute: "numeric",
                second: undefined,
                timeZone: undefined,
              })}
              )
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
