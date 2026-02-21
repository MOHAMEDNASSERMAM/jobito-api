import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/user.decorator.js';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
    constructor(private applicationsService: ApplicationsService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('student')
    apply(@Body('job_id') jobId: number, @CurrentUser() user: any) {
        return this.applicationsService.apply(user.sub, jobId);
    }

    @Get('my')
    @UseGuards(RolesGuard)
    @Roles('student')
    getMyApplications(@CurrentUser() user: any) {
        return this.applicationsService.getMyApplications(user.sub);
    }

    @Get('job/:jobId')
    @UseGuards(RolesGuard)
    @Roles('company')
    getJobApplications(@Param('jobId', ParseIntPipe) jobId: number) {
        return this.applicationsService.getJobApplications(jobId);
    }
}
