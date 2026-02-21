import { IsOptional, IsString, IsEnum, IsNumberString } from 'class-validator';
import { JobType } from '../job.entity.js';

export class FilterJobsDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(JobType)
    job_type?: JobType;

    @IsOptional()
    @IsNumberString()
    category_id?: string;

    @IsOptional()
    @IsNumberString()
    page?: string;

    @IsOptional()
    @IsNumberString()
    limit?: string;
}
