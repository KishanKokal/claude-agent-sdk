import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GettingStartedModule } from './getting-started/getting-started.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [GettingStartedModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
