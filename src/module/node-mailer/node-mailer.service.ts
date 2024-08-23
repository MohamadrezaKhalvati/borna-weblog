import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NodeMailerService {
  constructor(private mailService: MailerService) {}

  async sendVerificationEmail(email: string, code: number) {
    const message = `this is your verification code for borna weblog app: ${code}`;

    const result = await this.mailService.sendMail({
      from: 'Kingsley Okure <kingsleyokgeorge@gmail.com>',
      to: email,
      subject: `How to Send Emails with Nodemailer`,
      text: message,
    });
    return result;
  }
}
