import { Controller, Post } from '@nestjs/common';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post('discover-skills')
  async discoverSkills() {
    return await this.skillsService.discoverSkills();
  }

  @Post('write-blog-post')
  async writeBlogPost() {
    return await this.skillsService.writeBlogPost();
  }

  @Post('stock-analyzer')
  async stockAnalyzer() {
    return await this.skillsService.stockAnalyzer();
  }
}
