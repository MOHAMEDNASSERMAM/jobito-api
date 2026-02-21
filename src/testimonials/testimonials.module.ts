import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimonial } from './testimonial.entity.js';
import { TestimonialsService } from './testimonials.service.js';
import { TestimonialsController } from './testimonials.controller.js';

@Module({
    imports: [TypeOrmModule.forFeature([Testimonial])],
    controllers: [TestimonialsController],
    providers: [TestimonialsService],
})
export class TestimonialsModule { }
