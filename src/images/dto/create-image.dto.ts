import { IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ImageEntityType, ImageType } from '../image.entity.js';

export class CreateImageDto {
    @IsEnum(ImageEntityType)
    entity_type: ImageEntityType;

    @IsString()
    entity_id: string;

    @IsOptional()
    @IsEnum(ImageType)
    image_type?: ImageType;

    @IsOptional()
    @IsString()
    alt_text?: string;

    @IsOptional()
    @IsBoolean()
    is_primary?: boolean;
}
