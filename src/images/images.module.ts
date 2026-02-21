import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './image.entity.js';
import { ImagesService } from './images.service.js';
import { ImagesController } from './images.controller.js';

@Module({
    imports: [TypeOrmModule.forFeature([Image])],
    controllers: [ImagesController],
    providers: [ImagesService],
    exports: [ImagesService],
})
export class ImagesModule { }
