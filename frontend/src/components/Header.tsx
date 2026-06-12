import { useEffect, useState } from "react";
import AirshipIcon from "../assets/airship_small.png";
import { type Game } from "../types";
import { Util_mergeTotalGameHistory } from "../Util";
import TotalChart from "./TotalChart";

const GAME_HISTORY_INTERVAL = 60 * 1000; // one minute

export default function Header({ games }: { games: Game[] }) {
  const [numberGames, setNumberGames] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [platformOnlinePlayers, setPlatformOnlinePlayers] = useState<number>(0);
  const [totalDataPoints, setTotalDataPoints] = useState<
    Record<string, number>[] | undefined
  >(undefined);

  /** Set the total number of games */
  useEffect(() => {
    setNumberGames(games.length);
  }, [games]);

  /** Set total game history */
  useEffect(() => {
    async function updateTotalGamesHistory() {
      await Util_mergeTotalGameHistory(games).then((data) => {
        setTotalDataPoints(data);
        if (data.length > 0) setTotalPlayers(data[data.length - 1].Total);
      });
    }

    updateTotalGamesHistory();

    const interval = setInterval(() => {
      updateTotalGamesHistory();
    }, GAME_HISTORY_INTERVAL);

    return () => clearInterval(interval);
  }, [games]);

  /** Fetch platform online player count */
  useEffect(() => {
    async function updatePlatformStats() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/player-count/platform-stats`);
        const data = (await res.json()) as { onlinePlayers: number };
        setPlatformOnlinePlayers(data.onlinePlayers);
      } catch (err) {
        console.error("Error fetching platform stats:", err);
      }
    }

    updatePlatformStats();

    const interval = setInterval(updatePlatformStats, GAME_HISTORY_INTERVAL);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        updatePlatformStats();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {}, [totalDataPoints]);

  return (
    <div className="w-9/10 mx-auto mt-10">
      {/* Airship icon and name */}
      <div className="flex flex-row justify-left mx-auto mb-5">
        <a
          href={"https://store.steampowered.com/app/2381730/Airship"}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={AirshipIcon}
            alt={"Airship Icon"}
            width={70}
            height={70}
            className="object-cover mr-5"
          />
        </a>
        <h1 className="font-bold self-end">airship.top</h1>
      </div>

      {/* Subtitle */}
      <p className="text-xl text-white">
        Counting <span className="font-medium">{totalPlayers}</span>
        <span className="font-medium">
          {" "}
          players across {numberGames} top games, with{" "}
          {platformOnlinePlayers} total players online on{" "}
        </span>
        <a
          href="https://store.steampowered.com/app/2381730/Airship"
          target="_blank"
          rel="noopener noreferrer"
          className=""
        >
          <b>Airship</b>
        </a>
        .
      </p>

      <TotalChart games={games} totalDataPoints={totalDataPoints} />
    </div>
  );
}
