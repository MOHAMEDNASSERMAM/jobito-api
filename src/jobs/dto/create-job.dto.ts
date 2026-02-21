import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsEnum,
    IsInt,
    IsNumber,
    IsBoolean,
    Min,
} from 'class-validator';
import { JobType } from '../job.entity.js';

export class CreateJobDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt()
    company_id: number;

    @IsOptional()
    @IsInt()
    category_id?: number;

    @IsOptional()
    @IsNumber()
    salary?: number;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;

    @IsOptional()
    @IsEnum(JobType)
    job_type?: JobType;

    @IsOptional()
    @IsInt()
    @Min(1)
    slots_available?: number;

    @IsOptional()
    @IsString()
    price_type?: string;

    @IsOptional()
    @IsBoolean()
    is_negotiable?: boolean;
}
