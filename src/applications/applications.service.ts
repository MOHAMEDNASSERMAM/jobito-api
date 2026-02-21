import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './application.entity.js';
import { JobsService } from '../jobs/jobs.service.js';

@Injectable()
export class ApplicationsService {
    constructor(
        @InjectRepository(Application)
        private repo: Repository<Application>,
        private jobsService: JobsService,
    ) { }

    async apply(userId: string, jobId: number) {
        // Check if job exists
        const job = await this.jobsService.findOne(jobId);

        // Check slots
        const appliedCount = await this.jobsService.getApplicationCount(jobId);
        if (appliedCount >= job.slots_available) {
            throw new BadRequestException('This job has reached its capacity');
        }

        // Check if already applied
        const existing = await this.repo.findOne({
            where: { user_id: userId, job_id: jobId },
        });
        if (existing) {
            throw new BadRequestException('You have already applied to this job');
        }

        // Create application
        const application = this.repo.create({ user_id: userId, job_id: jobId });
        await this.repo.save(application);

        return { message: 'Application submitted successfully' };
    }

    async getMyApplications(userId: string) {
        return this.repo.find({
            where: { user_id: userId },
            relations: ['job', 'job.company', 'job.category'],
            order: { applied_at: 'DESC' },
        });
    }

    async getJobApplications(jobId: number) {
        return this.repo.find({
            where: { job_id: jobId },
            relations: ['user'],
            order: { applied_at: 'DESC' },
        });
    }
}
