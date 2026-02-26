import { Module } from '@nestjs/common';
import { GettingStartedService } from './getting-started.service';
import { GettingStartedController } from './getting-started.controller';

@Module({
  controllers: [GettingStartedController],
  providers: [GettingStartedService],
})
export class GettingStartedModule {}
