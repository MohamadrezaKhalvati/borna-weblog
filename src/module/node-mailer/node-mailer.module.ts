import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { NodeMailerService } from './node-mailer.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
  ],
  providers: [NodeMailerService],
  exports: [NodeMailerService],
})
export class NodeMailerModule {}
