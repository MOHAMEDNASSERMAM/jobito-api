import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.MAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    /** Send email verification code */
    async sendVerificationCode(to: string, code: string): Promise<void> {
        await this.transporter.sendMail({
            from: `"Jobito" <${process.env.MAIL_USER}>`,
            to,
            subject: 'Jobito — Verify Your Email',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
                    <h2 style="color: #1f2937; text-align: center;">Welcome to Jobito! 🎉</h2>
                    <p style="color: #4b5563; text-align: center;">Use this code to verify your email address:</p>
                    <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${code}</span>
                    </div>
                    <p style="color: #9ca3af; font-size: 13px; text-align: center;">This code expires in 10 minutes.</p>
                </div>
            `,
        });
    }

    /** Send password reset code */
    async sendPasswordResetCode(to: string, code: string): Promise<void> {
        await this.transporter.sendMail({
            from: `"Jobito" <${process.env.MAIL_USER}>`,
            to,
            subject: 'Jobito — Reset Your Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
                    <h2 style="color: #1f2937; text-align: center;">Password Reset 🔒</h2>
                    <p style="color: #4b5563; text-align: center;">Use this code to reset your password:</p>
                    <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #dc2626;">${code}</span>
                    </div>
                    <p style="color: #9ca3af; font-size: 13px; text-align: center;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
                </div>
            `,
        });
    }
}
