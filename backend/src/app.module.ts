import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PlayerCountModule } from './player-count/player-count.module';
import { PrismaModule } from './prisma/prisma.module';
import { SchedulerController } from './scheduler/scheduler.controller';

@Module({
  imports: [
    PlayerCountModule,
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute window
        limit: 30,  // 30 requests per IP per minute
      },
    ]),
  ],
  controllers: [SchedulerController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
