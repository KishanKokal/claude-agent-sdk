import { Controller, Post } from '@nestjs/common';
import { CustomToolsService } from './custom-tools.service';

@Controller('custom-tools')
export class CustomToolsController {
  constructor(private readonly customToolsService: CustomToolsService) {}

  @Post('use-weather-tool')
  async useWeatherTool() {
    return await this.customToolsService.useWeatherTool();
  }

  @Post('calculator')
  async calculator() {
    return await this.customToolsService.calculator();
  }
}
