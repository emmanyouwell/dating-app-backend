import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendVerificationEmail(to: string, code: string) {
    await this.resend.emails.send({
      from: 'no-reply@emmandev.site',
      to,
      subject: 'Verify your email',
      html: `<p>Your verification code is: <strong>${code}</strong></p>`,
    });
  }
}
