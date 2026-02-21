import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { Job } from '../jobs/job.entity.js';

@Entity({ schema: 'ptj', name: 'companies' })
export class Company {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    company_id: number;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ length: 255, nullable: true })
    contact_email: string;

    @Column({ length: 50, nullable: true })
    phone: string;

    @Column({ type: 'text', nullable: true })
    cr_document_url: string;

    @Column({ length: 50, default: 'PENDING' })
    verification_status: string;

    @Column({ type: 'text', nullable: true })
    rejection_reason: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @OneToMany(() => Job, (job) => job.company)
    jobs: Job[];
}
