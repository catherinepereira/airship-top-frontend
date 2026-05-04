/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client';
import {
  CLIENT_API,
  GAME_INFO_API,
  GAME_INFO_SUFFIX,
  GAMES_API,
} from 'src/constants';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type TopGamesFetchData = {
  timestamp: Date;
  topGames: Array<string>;
};

export async function getTopGames(
  prisma: PrismaClient,
): Promise<TopGamesFetchData | undefined> {
  try {
    let timestamp = new Date();
    const ms = timestamp.getTime(); // Get ms since epoch
    const roundedMs = Math.round(ms / 60000) * 60000; // Round to nearest minute (60,000 ms)
    timestamp = new Date(roundedMs);

    console.log(`[?] Getting top games...`);

    const res = await fetch(GAMES_API);

    if (!res.ok) {
      throw new Error(
        `Failed to fetch games with res status: ${res.statusText}`,
      );
    }

    const json = await res.json();
    if (json.length === 0) {
      return;
    }

    const gameData: {
      gameId: string;
      playerCount: number;
    }[] = [];
    const topGames: string[] = [];
    for (const game of json) {
      const gameId = game[0] as string;
      const playerCount = game[1] as number;
      gameData.push({ gameId, playerCount });
      topGames.push(gameId);
    }

    await storeTopGames(prisma, gameData, timestamp);

    const data: TopGamesFetchData = {
      timestamp,
      topGames,
    };
    return data;
  } catch (err) {
    console.error(`[✘] Error getting top games: ${err}`);
  }
}

type GameFetchData = {
  name: string;
  gameId: string;
  icon: string;
  livePlayerCount: number;
};

async function storeTopGames(
  prisma: PrismaClient,
  allGames: {
    gameId: string;
    playerCount: number;
  }[],
  timestamp: Date,
): Promise<Set<string> | undefined> {
  try {
    const gameIds = new Set<string>();
    const apiData = new Array<GameFetchData>();

    for (const game of allGames) {
      // Don't duplicate entries
      const gameId = game.gameId;
      if (gameIds.has(gameId)) continue;
      gameIds.add(gameId);
    }

    try {
      await prisma.latestTopGames.create({
        data: {
          timestamp,
          topGames: Array.from(gameIds),
        },
      });
    } catch (err) {
      console.error(`[✘] Failed to store latest top games:`, err);
    }

    for (const gameId of gameIds) {
      const res = await fetch(GAME_INFO_API + gameId + GAME_INFO_SUFFIX);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch game info with res status: ${res.statusText}`,
        );
      }

      const json = await res.json();
      const gameInfo = json['game'];

      apiData.push({
        name: gameInfo.name,
        gameId: gameId,
        icon: gameInfo.iconImageId,
        livePlayerCount: gameInfo.liveStats.playerCount,
      });

      await sleep(500);
    }

    for (const uniqueGame of apiData) {
      await prisma.game.upsert({
        where: { gameId: uniqueGame.gameId },
        update: {
          gameId: uniqueGame.gameId,
          name: uniqueGame.name,
          icon: uniqueGame.icon,
        },
        create: {
          name: uniqueGame.name,
          gameId: uniqueGame.gameId,
          icon: uniqueGame.icon,
          game24hrPeak: 0,
          record: 0,
          recordDate: timestamp,
        },
      });

      console.log(
        `[✔] Upserted game database with updated entry for ${uniqueGame.name}`,
      );

      await prisma.playerCount.create({
        data: {
          players: uniqueGame.livePlayerCount,
          gameId: uniqueGame.gameId,
          timestamp,
        },
      });

      console.log(
        `[✔] Upserted player count with updated entry for ${uniqueGame.name}`,
      );

      await updateGameRecord(prisma, uniqueGame.gameId, uniqueGame.livePlayerCount);
    }

    return gameIds;
  } catch (err) {
    console.error(`[✘] Error formatting game into Prisma: ${err}`);
  }
}

/** Checks whether latest count is greater than current record, if so, updates it */
async function updateGameRecord(
  prisma: PrismaClient,
  gameId: string,
  latestCount: number,
) {
  if (latestCount === 0) return;

  try {
    const foundGame = await prisma.game.findFirstOrThrow({
      where: { gameId },
    });

    const currentRecord = foundGame.record;
    if (latestCount <= currentRecord) return;

    console.log(
      `[!!!] New record for ${foundGame.name} ${latestCount} at ${new Date().toISOString()}`,
    );

    await prisma.game.update({
      where: { gameId },
      data: {
        record: latestCount,
        recordDate: new Date().toISOString(),
        game24hrPeak: latestCount, // we know this must then be the highest daily peak
      },
    });
  } catch (err) {
    console.error(`[✘] Error fetching history for game ${gameId}:`, err);
  }
}

const BATCH_SIZE = 10_000;

async function deleteOldPlayerCounts(
  prisma: PrismaClient,
  retentionDays = 2,
  batchSize = BATCH_SIZE,
) {
  // Use raw SQL with ctid batching so Postgres can LIMIT deletes efficiently
  const deleted = await prisma.$executeRawUnsafe(`
    WITH del AS (
      SELECT ctid
      FROM "PlayerCount"
      WHERE "timestamp" < NOW() - INTERVAL '${retentionDays} days'
      LIMIT ${batchSize}
    )
    DELETE FROM "PlayerCount"
    WHERE ctid IN (SELECT ctid FROM del);
  `);
  return Number(deleted); // rows deleted this batch
}

async function deleteOldLatestTopGames(
  prisma: PrismaClient,
  retentionDays = 2,
  batchSize = BATCH_SIZE,
) {
  const deleted = await prisma.$executeRawUnsafe(`
    WITH del AS (
      SELECT ctid
      FROM "LatestTopGames"
      WHERE "timestamp" < NOW() - INTERVAL '${retentionDays} days'
      LIMIT ${batchSize}
    )
    DELETE FROM "LatestTopGames"
    WHERE ctid IN (SELECT ctid FROM del);
  `);
  return Number(deleted);
}

async function deleteOldPlatformStats(
  prisma: PrismaClient,
  retentionDays = 2,
  batchSize = BATCH_SIZE,
) {
  const deleted = await prisma.$executeRawUnsafe(`
    WITH del AS (
      SELECT ctid
      FROM "PlatformStats"
      WHERE "timestamp" < NOW() - INTERVAL '${retentionDays} days'
      LIMIT ${batchSize}
    )
    DELETE FROM "PlatformStats"
    WHERE ctid IN (SELECT ctid FROM del);
  `);
  return Number(deleted);
}

export async function runRetentionJob(prisma: PrismaClient) {
  try {
    let count = 0,
      total = 0;
    do {
      count = await deleteOldPlayerCounts(prisma, 2, BATCH_SIZE);
      total += count;
      if (count > 0) {
        await new Promise((r) => setTimeout(r, 250));
      }
    } while (count > 0);
    console.log(`[✔] Deleted ${total} old PlayerCount rows.`);

    count = 0;
    total = 0;
    do {
      count = await deleteOldLatestTopGames(prisma, 2, BATCH_SIZE);
      total += count;
      if (count > 0) {
        await new Promise((r) => setTimeout(r, 250));
      }
    } while (count > 0);
    console.log(`[✔] Deleted ${total} old LatestTopGames rows.`);

    count = 0;
    total = 0;
    do {
      count = await deleteOldPlatformStats(prisma, 2, BATCH_SIZE);
      total += count;
      if (count > 0) {
        await new Promise((r) => setTimeout(r, 250));
      }
    } while (count > 0);
    console.log(`[✔] Deleted ${total} old PlatformStats rows.`);
  } catch (err) {
    console.error(`[✘] Retention job failed:`, err);
  }
}

export async function getPlatformStats(prisma: PrismaClient): Promise<void> {
  try {
    let timestamp = new Date();
    const ms = timestamp.getTime();
    const roundedMs = Math.round(ms / 60000) * 60000;
    timestamp = new Date(roundedMs);

    const res = await fetch(CLIENT_API);
    if (!res.ok) {
      throw new Error(`Failed to fetch platform stats: ${res.statusText}`);
    }

    const json = await res.json();
    const onlinePlayers = json.players.online as number;

    await prisma.platformStats.create({
      data: { timestamp, onlinePlayers },
    });

    console.log(`[✔] Stored platform stats: ${onlinePlayers} online players`);
  } catch (err) {
    console.error(`[✘] Error getting platform stats: ${err}`);
  }
}
