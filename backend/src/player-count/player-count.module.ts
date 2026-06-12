import { Module } from '@nestjs/common';
import { PlayerCountController } from './player-count.controller';
import { PlayerCountService } from './player-count.service';

@Module({
  providers: [PlayerCountService],
  controllers: [PlayerCountController],
})
export class PlayerCountModule {}
