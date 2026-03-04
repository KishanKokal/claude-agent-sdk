import { Module } from '@nestjs/common';
import { MultiAgentSystemsService } from './multi-agent-systems.service';
import { MultiAgentSystemsController } from './multi-agent-systems.controller';

@Module({
  controllers: [MultiAgentSystemsController],
  providers: [MultiAgentSystemsService],
})
export class MultiAgentSystemsModule {}
