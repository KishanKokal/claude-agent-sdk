import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GettingStartedModule } from './getting-started/getting-started.module';
import { ConfigModule } from '@nestjs/config';
import { HooksModule } from './hooks/hooks.module';
import { SkillsModule } from './skills/skills.module';
import { CustomToolsModule } from './custom-tools/custom-tools.module';
import { MultiAgentSystemsModule } from './multi-agent-systems/multi-agent-systems.module';

@Module({
  imports: [GettingStartedModule, ConfigModule.forRoot(), HooksModule, SkillsModule, CustomToolsModule, MultiAgentSystemsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
