import { Controller, Get, Header } from '@nestjs/common';
import { Game } from '@prisma/client';
import { PlayerCountService } from './player-count.service';

@Controller('player-count')
export class PlayerCountController {
  constructor(private readonly playerCountService: PlayerCountService) {}

  @Get('games')
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')
  getGames(): Promise<Game[]> {
    return this.playerCountService.getTopGames();
  }

  @Get('platform-stats')
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')
  getPlatformStats(): Promise<{ onlinePlayers: number }> {
    return this.playerCountService.getLatestPlatformStats();
  }
}
