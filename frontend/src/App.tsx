import { useEffect, useState } from "react";
import Footer from "./components/Footer";
import GamesSection from "./components/GamesSection";
import Header from "./components/Header";
import { type Game } from "./types";
import { Util_fetchGames } from "./Util";

function App() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    async function updateGames() {
      await Util_fetchGames().then((newGames) => {
        setGames(newGames);
      });
    }

    updateGames();

    // Schedule fetch 5s after the start of each new minute
    let timeout: ReturnType<typeof setTimeout>;
    function scheduleNext() {
      const now = new Date();
      const msUntilNextMinute =
        (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      timeout = setTimeout(async () => {
        await updateGames();
        scheduleNext();
      }, msUntilNextMinute + 5_000);
    }
    scheduleNext();

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        updateGames();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {}, [games]);

  return (
    <div className="space-y-10">
      <Header games={games} />
      <GamesSection games={games} />
      <Footer />
    </div>
  );
}

export default App;
