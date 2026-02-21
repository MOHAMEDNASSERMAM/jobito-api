import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { User } from '../users/user.entity.js';
import { Job } from '../jobs/job.entity.js';

@Entity({ schema: 'ptj', name: 'applications' })
@Unique(['job_id', 'user_id'])
export class Application {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    application_id: number;

    @ManyToOne(() => Job, (job) => job.applications)
    @JoinColumn({ name: 'job_id' })
    job: Job;

    @Column({ type: 'bigint' })
    job_id: number;

    @ManyToOne(() => User, (user) => user.applications)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ length: 50, default: 'applied' })
    status: string;

    @CreateDateColumn({ type: 'timestamptz' })
    applied_at: Date;
}
