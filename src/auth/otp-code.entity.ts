import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity.js';

@Entity({ schema: 'ptj', name: 'otp_codes' })
export class OtpCode {
    @PrimaryGeneratedColumn('uuid')
    otp_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ length: 10 })
    code: string;

    @Column({ type: 'timestamptz' })
    expires_at: Date;

    @Column({ default: false })
    is_used: boolean;
}
