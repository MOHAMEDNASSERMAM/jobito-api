import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('') // Adding a new endpoint for the root path
  getRoot() {
    return { message: 'API is working' };
  }
}
