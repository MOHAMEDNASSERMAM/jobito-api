import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) { }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  create(userData: Partial<User>) {
    const user = this.repo.create(userData);
    return this.repo.save(user);
  }

  findById(userId: string) {
    return this.repo.findOne({ where: { user_id: userId } });
  }

  async update(userId: string, data: Partial<User>) {
    await this.repo.update(userId, data);
    return this.findById(userId);
  }
}
