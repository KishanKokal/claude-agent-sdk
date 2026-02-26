import { Controller } from '@nestjs/common';
import { GettingStartedService } from './getting-started.service';

@Controller('getting-started')
export class GettingStartedController {
  constructor(private readonly gettingStartedService: GettingStartedService) {}
}
