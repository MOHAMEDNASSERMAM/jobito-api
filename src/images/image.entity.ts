import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

export enum ImageEntityType {
    USER = 'user',
    COMPANY = 'company',
    JOB = 'job',
    GROUP = 'group',
}

export enum ImageType {
    PROFILE = 'profile',
    LOGO = 'logo',
    COVER = 'cover',
    GALLERY = 'gallery',
    PORTFOLIO = 'portfolio',
}

@Entity({ schema: 'ptj', name: 'images' })
export class Image {
    @PrimaryGeneratedColumn('uuid')
    image_id: string;

    @Column({ type: 'enum', enum: ImageEntityType, enumName: 'ptj_image_entity' })
    entity_type: ImageEntityType;

    @Column({ type: 'text' })
    entity_id: string;

    @Column({ type: 'enum', enum: ImageType, enumName: 'ptj_image_type', default: ImageType.GALLERY })
    image_type: ImageType;

    @Column({ type: 'text' })
    image_url: string;

    @Column({ type: 'int', nullable: true })
    file_size: number;

    @Column({ type: 'text', nullable: true })
    alt_text: string;

    @Column({ default: false })
    is_primary: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
}
