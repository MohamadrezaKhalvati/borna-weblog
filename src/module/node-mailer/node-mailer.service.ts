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
      subject: `borna weblog verification code`,
      text: message,
    });
    return result;
  }

  async sendChangePasswordEmail(email: string, code: number) {
    const message = `this is your  code for changing password of  borna weblog app: ${code}`;

    const result = await this.mailService.sendMail({
      from: 'Kingsley Okure <kingsleyokgeorge@gmail.com>',
      to: email,
      subject: `borna weblog changing password code`,
      text: message,
    });
  }
}
