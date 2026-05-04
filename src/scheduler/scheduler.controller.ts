import { Controller, Get, HttpCode } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  getTopGames,
  getPlatformStats,
  runRetentionJob,
} from 'src/prisma/prisma-client';
import { PrismaService } from 'src/prisma/prisma.service';

@SkipThrottle()
@Controller()
export class SchedulerController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('collect')
  @HttpCode(200)
  async collect(): Promise<{ ok: boolean }> {
    await Promise.all([getTopGames(this.prisma), getPlatformStats(this.prisma)]);
    return { ok: true };
  }

  @Get('cleanup')
  @HttpCode(200)
  async cleanup(): Promise<{ ok: boolean }> {
    await runRetentionJob(this.prisma);
    return { ok: true };
  }
}
