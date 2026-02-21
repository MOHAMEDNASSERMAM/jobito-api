import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './testimonial.entity.js';

@Injectable()
export class TestimonialsService {
    constructor(
        @InjectRepository(Testimonial)
        private repo: Repository<Testimonial>,
    ) { }

    /**
     * الـ featured testimonials اللي بتظهر في الصفحة الرئيسية
     * بترجع الـ user معاها (full_name, email) عشان الـ React component
     */
    getFeatured() {
        return this.repo.find({
            where: { is_featured: true },
            relations: ['user'],
            order: { created_at: 'DESC' },
        });
    }

    findAll() {
        return this.repo.find({
            relations: ['user'],
            order: { created_at: 'DESC' },
        });
    }

    create(userId: string, body: string) {
        const testimonial = this.repo.create({ user_id: userId, body });
        return this.repo.save(testimonial);
    }
}
