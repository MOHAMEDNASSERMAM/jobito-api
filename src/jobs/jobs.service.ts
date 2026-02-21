import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Job } from './job.entity.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { FilterJobsDto } from './dto/filter-jobs.dto.js';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private repo: Repository<Job>,
    private dataSource: DataSource,
  ) { }

  async findAll(filters: FilterJobsDto) {
    const page = parseInt(filters.page || '1');
    const limit = parseInt(filters.limit || '10');
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.category', 'category')
      .where('job.is_active = :active', { active: true });

    if (filters.search) {
      qb.andWhere(
        '(LOWER(job.title) LIKE LOWER(:search) OR LOWER(job.description) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.job_type) {
      qb.andWhere('job.job_type = :jobType', { jobType: filters.job_type });
    }

    if (filters.category_id) {
      qb.andWhere('job.category_id = :catId', {
        catId: parseInt(filters.category_id),
      });
    }

    qb.orderBy('job.created_at', 'DESC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const job = await this.repo.findOne({
      where: { job_id: id },
      relations: ['company', 'category'],
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  create(data: CreateJobDto) {
    const job = this.repo.create(data);
    return this.repo.save(job);
  }

  async update(id: number, data: UpdateJobDto) {
    const job = await this.findOne(id);
    Object.assign(job, data);
    return this.repo.save(job);
  }

  async remove(id: number) {
    const job = await this.findOne(id);
    job.is_active = false;
    return this.repo.save(job);
  }

  async getNearbyJobs(lon: number, lat: number, radius: number) {
    const query = `
      SELECT j.job_id, j.title, j.description, j.salary, j.job_type, j.slots_available,
             j.address, j.latitude, j.longitude, j.created_at,
             c.company_id, c.name as company_name,
             cat.category_id, cat.name as category_name,
             ST_Distance(j.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_m
      FROM ptj.jobs j
      LEFT JOIN ptj.companies c ON j.company_id = c.company_id
      LEFT JOIN ptj.categories cat ON j.category_id = cat.category_id
      WHERE j.is_active = true
        AND ST_DWithin(j.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
      ORDER BY distance_m ASC
    `;
    return this.dataSource.query(query, [lon, lat, radius]);
  }

  async getApplicationCount(jobId: number): Promise<number> {
    const result = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM ptj.applications WHERE job_id = $1',
      [jobId],
    );
    return parseInt(result[0].count);
  }
}
