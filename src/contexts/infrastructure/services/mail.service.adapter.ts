import { MailService } from '@/contexts/domain/services';
import { Mail } from '@/contexts/domain/models/mail.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendMailService implements MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async send(mail: Mail): Promise<boolean> {
    // Skip email sending when disabled (e.g. E2E testing, quota exhausted)
    if (this.configService.get<string>('DISABLE_EMAILS') === 'true') {
      console.log('[ResendMailService] Email sending disabled — skipping');
      return true;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${mail.from.name} <${mail.from.email}>`,
        to: mail.to.map((recipient) => recipient.email),
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });

      if (error) {
        console.error('[ResendMailService] Failed to send email:', error);
        return false;
      }

      return !!data?.id;
    } catch (error) {
      console.error('[ResendMailService] Error sending email:', error);
      return false;
    }
  }

  async sendMany(mail: Mail): Promise<boolean> {
    return this.send(mail);
  }
}
