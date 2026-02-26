import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GettingStartedModule } from './getting-started/getting-started.module';

@Module({
  imports: [GettingStartedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
