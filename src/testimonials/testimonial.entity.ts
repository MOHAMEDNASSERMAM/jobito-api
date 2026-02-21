import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity.js';

@Entity({ schema: 'ptj', name: 'testimonials' })
export class Testimonial {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    testimonial_id: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'text' })
    body: string;

    @Column({ default: false })
    is_featured: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
}
