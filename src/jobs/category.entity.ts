import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ schema: 'ptj', name: 'categories' })
export class Category {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    category_id: number;

    @Column({ length: 150, unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;
}
