import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Application } from '../applications/application.entity.js';

@Entity({ schema: 'ptj', name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ length: 255 })
  full_name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'text', nullable: true })
  password_hash: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 50, default: 'student' })
  role: string;




  @Column({ type: 'jsonb', nullable: true })
  skills: any;

  @Column({ type: 'int', default: 0 })
  experience: number;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'int', default: 10 })
  service_radius_km: number;

  @Column({ default: false })
  is_phone_verified: boolean;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => Application, (app) => app.user)
  applications: Application[];
}
