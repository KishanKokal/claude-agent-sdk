import { Module } from '@nestjs/common';
import { CustomToolsService } from './custom-tools.service';
import { CustomToolsController } from './custom-tools.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [CustomToolsController],
  providers: [CustomToolsService],
})
export class CustomToolsModule {}
