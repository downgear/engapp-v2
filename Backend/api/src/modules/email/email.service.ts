import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';

type SendMode = 'resend' | 'smtp' | 'none';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly mode: SendMode;
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;

  constructor() {
    const resendKey = process.env.RESEND_API_KEY?.trim();
    if (resendKey) {
      this.resend = new Resend(resendKey);
      this.mode = 'resend';
      this.logger.log('Email: using Resend (chỉ cần RESEND_API_KEY — đơn giản nhất)');
      return;
    }

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });
      this.mode = 'smtp';
      this.logger.log('Email: using SMTP (nodemailer)');
      return;
    }

    this.mode = 'none';
    this.logger.warn(
      'Email chưa cấu hình — gửi mail sẽ bị bỏ qua. Cách nhanh: thêm RESEND_API_KEY (xem .env.example). Hoặc SMTP_* như cũ.',
    );
  }

  private canSend(): boolean {
    return this.mode !== 'none';
  }

  /** Địa chỉ người gửi (Resend yêu cầu domain đã verify hoặc dùng onboarding@resend.dev khi test) */
  private getResendFrom(): string {
    return (
      process.env.RESEND_FROM?.trim() ||
      'Lingriser <onboarding@resend.dev>'
    );
  }

  private async dispatchHtml(to: string, subject: string, html: string): Promise<void> {
    if (this.mode === 'resend' && this.resend) {
      const from = this.getResendFrom();
      this.logger.log(`Resend: sending from=${from} to=${to}`);
      const { data, error } = await this.resend.emails.send({
        from,
        to: [to],
        subject,
        html,
      });
      if (error) {
        const msg = typeof error === 'object' && error && 'message' in error
          ? String((error as { message: string }).message)
          : JSON.stringify(error);
        this.logger.error(`Resend error (from=${from} to=${to}): ${msg}`);
        throw new Error(msg);
      }
      this.logger.log(`Resend: delivered id=${data?.id}`);
      return;
    }

    if (this.mode === 'smtp' && this.transporter) {
      const from = process.env.SMTP_FROM || process.env.SMTP_USER;
      await this.transporter.sendMail({
        from: `"Lingriser" <${from}>`,
        to,
        subject,
        html,
      });
      return;
    }
  }

  async sendWelcomeEmail(to: string, fullName: string, password: string, role: string): Promise<void> {
    if (!this.canSend()) return;

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

    const roleLabel: Record<string, string> = {
      student: 'Học sinh',
      parent: 'Phụ huynh',
      teacher: 'Giáo viên',
      mentor: 'Mentor (Giáo viên nước ngoài)',
    };

    const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Chào mừng đến với Lingriser! 🎉</h2>
            <p>Xin chào <strong>${fullName}</strong>,</p>
            <p>Tài khoản của bạn đã được tạo thành công với vai trò <strong>${roleLabel[role] || role}</strong>.</p>
            <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Email đăng nhập:</strong> ${to}</p>
              <p style="margin: 4px 0;"><strong>Mật khẩu:</strong> ${password}</p>
            </div>
            <p>Vui lòng đăng nhập tại: <a href="${appUrl}" style="color: #4F46E5;">${appUrl}</a></p>
            <p style="color: #9CA3AF; font-size: 14px;">Để bảo mật, hãy đổi mật khẩu sau lần đăng nhập đầu tiên.</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
            <p style="color: #9CA3AF; font-size: 12px;">Email này được gửi tự động từ hệ thống Lingriser.</p>
          </div>
        `;

    try {
      await this.dispatchHtml(to, 'Tài khoản Lingriser của bạn đã được tạo', html);
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err}`);
    }
  }

  async sendSelfRegistrationEmail(to: string, fullName: string, password: string, role: string): Promise<void> {
    if (!this.canSend()) return;

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

    const roleLabel: Record<string, string> = {
      student: 'Học sinh',
      parent: 'Phụ huynh',
      teacher: 'Giáo viên',
      mentor: 'Mentor (Giáo viên nước ngoài)',
    };

    const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Đăng ký thành công! 🎉</h2>
            <p>Xin chào <strong>${fullName}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký Lingriser. Tài khoản của bạn đã được kích hoạt với vai trò <strong>${roleLabel[role] || role}</strong>.</p>
            <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Email đăng nhập:</strong> ${to}</p>
              <p style="margin: 4px 0;"><strong>Mật khẩu bạn đã đặt:</strong> ${password}</p>
            </div>
            <p>Truy cập ứng dụng tại: <a href="${appUrl}" style="color: #4F46E5;">${appUrl}</a></p>
            <p style="color: #9CA3AF; font-size: 14px;">Nếu bạn không thực hiện đăng ký này, vui lòng liên hệ hỗ trợ ngay.</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
            <p style="color: #9CA3AF; font-size: 12px;">Email tự động từ Lingriser.</p>
          </div>
        `;

    try {
      await this.dispatchHtml(to, 'Đăng ký Lingriser thành công — thông tin đăng nhập', html);
      this.logger.log(`Self-registration email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send self-registration email to ${to}: ${err}`);
    }
  }
}
