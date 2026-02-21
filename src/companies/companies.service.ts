import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';

@Injectable()
export class CompaniesService {
    constructor(
        @InjectRepository(Company)
        private repo: Repository<Company>,
    ) { }

    findAll() {
        return this.repo.find();
    }

    async findOne(id: number) {
        const company = await this.repo.findOne({
            where: { company_id: id },
            relations: ['jobs'],
        });
        if (!company) {
            throw new NotFoundException('Company not found');
        }
        return company;
    }

    create(data: CreateCompanyDto) {
        const company = this.repo.create(data);
        return this.repo.save(company);
    }

    async update(id: number, data: UpdateCompanyDto) {
        const company = await this.findOne(id);
        Object.assign(company, data);
        return this.repo.save(company);
    }
}
