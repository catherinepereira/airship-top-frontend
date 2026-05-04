import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DataPoint, type GameDto } from '../types';

@Injectable()
export class PlayerCountService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopGames(): Promise<GameDto[]> {
    try {
      const latestTopGames = await this.prisma.latestTopGames.findFirst({
        orderBy: { timestamp: 'desc' },
      });

      if (!latestTopGames) {
        throw new Error('Could not find latest top games');
      }

      const gameIds = latestTopGames.topGames;

      const currentTimestamp = latestTopGames.timestamp;

      const games: GameDto[] = [];
      for (const gameId of gameIds) {
        const gameData = await this.prisma.game.findUnique({
          where: { gameId },
        });
        if (!gameData) continue;

        const history = await this.getGameHistory(gameId);
        const game24hrPeak = await this.getGame24hrPeak(gameId);

        const currentCount = await this.prisma.playerCount.findUnique({
          where: { gameId_timestamp: { gameId, timestamp: currentTimestamp } },
        });

        const game: GameDto = {
          name: gameData.name,
          gameId: gameData.gameId,
          icon: gameData.icon,
          players: currentCount?.players ?? 0,
          game24hrPeak: game24hrPeak,
          record: gameData.record,
          recordDate: gameData.recordDate,
          playerCounts: history,
        };
        games.push(game);
      }

      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentGames = games.filter((g) => {
        const latestDataPoint = g.playerCounts.at(-1);
        return latestDataPoint && latestDataPoint.timestamp >= tenMinutesAgo;
      });

      const sortedGames = recentGames
        .sort((a, b) => b.players - a.players)
        .slice(0, 10);

      return sortedGames;
    } catch (err) {
      console.error('Error getting top games:', err);
      return [];
    }
  }

  async getGameHistory(gameId: string): Promise<DataPoint[]> {
    try {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const prismaData = await this.prisma.playerCount.findMany({
        where: {
          gameId,
          timestamp: {
            gte: sixHoursAgo,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      const dataPoints: DataPoint[] = prismaData
        .map((v) => {
          const dataPoint = { timestamp: v.timestamp, players: v.players };
          return dataPoint;
        })
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      return dataPoints;
    } catch (err) {
      console.error(`Error fetching history for game ${gameId}:`, err);
      return [];
    }
  }

  async getGameRecord(
    gameId: string,
  ): Promise<{ recordCount: number; recordDate: Date }> {
    try {
      const prismaData = await this.prisma.game.findFirstOrThrow({
        where: { gameId },
      });

      return {
        recordCount: prismaData.record,
        recordDate: prismaData.recordDate,
      };
    } catch (err) {
      console.error(`Error fetching history for game ${gameId}:`, err);
      return {
        recordCount: 0,
        recordDate: new Date(),
      };
    }
  }

  async getLatestPlatformStats(): Promise<{ onlinePlayers: number }> {
    try {
      const latest = await this.prisma.platformStats.findFirstOrThrow({
        orderBy: { timestamp: 'desc' },
      });
      return { onlinePlayers: latest.onlinePlayers };
    } catch (err) {
      console.error('Error fetching platform stats:', err);
      return { onlinePlayers: 0 };
    }
  }

  async getGame24hrPeak(gameId: string): Promise<number> {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const result = await this.prisma.playerCount.aggregate({
        _max: {
          players: true,
        },
        where: {
          gameId,
          timestamp: {
            gte: twentyFourHoursAgo,
          },
        },
      });

      return result._max.players ?? 0;
    } catch (err) {
      console.error(`Error fetching history for game ${gameId}:`, err);
      return 0;
    }
  }
}
