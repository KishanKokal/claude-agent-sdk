import { Controller, Post, Query } from '@nestjs/common';
import { GettingStartedService } from './getting-started.service';

@Controller('getting-started')
export class GettingStartedController {
  constructor(private readonly gettingStartedService: GettingStartedService) {}

  @Post('your-first-agent')
  async yourFirstAgent(@Query('prompt') prompt: string) {
    return await this.gettingStartedService.yourFirstAgent(prompt);
  }

  @Post('basic-stock-analysis')
  async basicStockAnalysis() {
    return await this.gettingStartedService.basicStockAnalysis();
  }
}
