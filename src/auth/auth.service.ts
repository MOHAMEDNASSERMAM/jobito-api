import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import { CompaniesService } from '../companies/companies.service.js';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service.js';
import { OtpCode } from './otp-code.entity.js';
import * as bcrypt from 'bcryptjs';




@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private jwtService: JwtService,
    private mailService: MailService,
    @InjectRepository(OtpCode)
    private otpRepo: Repository<OtpCode>,
  ) { }

  /** Generate a random 6-digit code */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /** Save OTP code to DB + cleanup old expired codes */
  private async saveOtp(userId: string, code: string): Promise<OtpCode> {
    // Invalidate previous unused codes for this user
    await this.otpRepo.update(
      { user_id: userId, is_used: false },
      { is_used: true },
    );

    // Cleanup expired codes older than 1 hour (issue #10)
    await this.otpRepo.delete({
      expires_at: LessThan(new Date(Date.now() - 60 * 60 * 1000)),
    });

    const otp = this.otpRepo.create({
      user_id: userId,
      code,
      expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });
    return this.otpRepo.save(otp);
  }

  /** Validate OTP code */
  private async validateOtp(userId: string, code: string): Promise<OtpCode> {
    const otp = await this.otpRepo.findOne({
      where: {
        user_id: userId,
        code,
        is_used: false,
        expires_at: MoreThan(new Date()),
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired code');
    }

    // Mark as used
    otp.is_used = true;
    await this.otpRepo.save(otp);
    return otp;
  }

  // ─── Registration ─────────────────────────────────────────────

  async register(data: any) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    // Fix issue #8: use async hash
    const hash = await bcrypt.hash(data.password, 10);
    const role = data.role || 'student';
    let user: any;

    if (role === 'student') {
      user = await this.usersService.create({
        full_name: data.full_name || data.fullName || data.name || data.email.split('@')[0],
        email: data.email,
        password_hash: hash,
        role: 'student',
        skills: data.skills || null,
        experience: data.experience || 0,
        is_active: false,
      });
    } else if (role === 'company') {
      user = await this.usersService.create({
        full_name: data.name || data.full_name || data.email.split('@')[0],
        email: data.email,
        password_hash: hash,
        role: 'company',
        is_active: false,
      });

      // Fix issue #11: also create a companies row
      await this.companiesService.create({
        name: data.name,
        description: data.description,
        address: data.address,
        contact_email: data.contact_email || data.email,
        phone: data.phone,
        cr_document_url: data.cr_document_url,
      });
    } else {
      // Fix issue #1: guard against unexpected roles
      throw new BadRequestException('Invalid role. Must be student or company.');
    }

    // ✅ Generate code and save to DB first
    const code = this.generateCode();
    await this.saveOtp(user.user_id, code);

    // ✅ fire-and-forget: لا ننتظر الإيميل — يرد الـ API فوراً
    console.log(`[DEV] Verification code for ${data.email}: ${code}`);
    this.mailService.sendVerificationCode(data.email, code).catch(console.error);

    return { message: 'Registration successful. Please check your email for the verification code.' };
  }

  // ─── Email Verification ───────────────────────────────────────

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    if (user.is_active) {
      return { message: 'Email already verified' };
    }

    await this.validateOtp(user.user_id, code);
    await this.usersService.update(user.user_id, { is_active: true });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  // ─── Resend Code ──────────────────────────────────────────────

  async resendCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    if (user.is_active) {
      return { message: 'Email already verified' };
    }

    const code = this.generateCode();
    await this.saveOtp(user.user_id, code);
    await this.mailService.sendVerificationCode(email, code);

    return { message: 'Verification code sent to your email' };
  }

  // ─── Login ────────────────────────────────────────────────────

  async login(data: any) {
    const user = await this.usersService.findByEmail(data.email);

    // Check user exists first
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // If account was created via Google, it has no password
    if (!user.password_hash) {
      throw new UnauthorizedException('This account uses Google login. Please sign in with Google.');
    }

    // Fix issue #8: use async compare
    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // ─── Forgot Password ─────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const code = this.generateCode();
    await this.saveOtp(user.user_id, code);
    await this.mailService.sendPasswordResetCode(email, code);

    return { message: 'Password reset code sent to your email' };
  }

  // ─── Reset Password ──────────────────────────────────────────

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    await this.validateOtp(user.user_id, code);

    // Fix issue #8: use async hash
    const hash = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.user_id, { password_hash: hash });

    return { message: 'Password reset successfully. You can now log in with your new password.' };
  }
}
