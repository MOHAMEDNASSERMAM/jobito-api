import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
} from '@nestjs/common';
import { TestimonialsService } from './testimonials.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/user.decorator.js';

@Controller('testimonials')
export class TestimonialsController {
    constructor(private testimonialsService: TestimonialsService) { }

    /** GET /testimonials/featured — للـ Testimonial component في الصفحة الرئيسية */
    @Get('featured')
    getFeatured() {
        return this.testimonialsService.getFeatured();
    }

    /** GET /testimonials — كل التقييمات */
    @Get()
    findAll() {
        return this.testimonialsService.findAll();
    }

    /** POST /testimonials — إضافة تقييم جديد (محتاج login) */
    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body('body') body: string, @CurrentUser() user: any) {
        return this.testimonialsService.create(user.sub, body);
    }
}
