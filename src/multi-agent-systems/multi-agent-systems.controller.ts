import { Controller, Post } from '@nestjs/common';
import { MultiAgentSystemsService } from './multi-agent-systems.service';

@Controller('multi-agent-systems')
export class MultiAgentSystemsController {
  constructor(
    private readonly multiAgentSystemsService: MultiAgentSystemsService,
  ) {}

  @Post('write-blog')
  async writeBlog() {
    return await this.multiAgentSystemsService.writeBlog();
  }
}
