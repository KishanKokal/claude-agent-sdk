import { Controller, Post } from '@nestjs/common';
import { HooksService } from './hooks.service';

@Controller('hooks')
export class HooksController {
  constructor(private readonly hooksService: HooksService) {}

  @Post('test-block-ls-command')
  async testBlockLsCommand() {
    return await this.hooksService.testBlockLsCommand();
  }
}
