import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Company } from '../companies/company.entity.js';
import { Category } from './category.entity.js';
import { Application } from '../applications/application.entity.js';

export enum JobType {
    PART_TIME = 'part-time',
    ONE_TIME = 'one-time',
    EVENT = 'event',
    FREELANCE = 'freelance',
    INTERNSHIP = 'internship',
}

@Entity({ schema: 'ptj', name: 'jobs' })
export class Job {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    job_id: number;

    @ManyToOne(() => Company, (company) => company.jobs, { eager: true })
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column({ type: 'bigint', nullable: true })
    company_id: number;

    @ManyToOne(() => Category, { eager: true, nullable: true })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({ type: 'bigint', nullable: true })
    category_id: number;

    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
    salary: number;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
    latitude: number;

    @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
    longitude: number;

    @Column({
        type: 'enum',
        enum: JobType,
        enumName: 'ptj_job_type',
        default: JobType.PART_TIME,
    })
    job_type: JobType;

    @Column({ type: 'int', default: 1 })
    slots_available: number;

    @Column({ length: 50, default: 'fixed' })
    price_type: string;

    @Column({ default: false })
    is_negotiable: boolean;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    @OneToMany(() => Application, (app) => app.job)
    applications: Application[];
}
