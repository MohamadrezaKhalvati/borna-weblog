import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeMailerModule } from '../node-mailer/node-mailer.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { TokenGuard } from './guards/token.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    NodeMailerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_TOKEN,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_DATE },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: TokenGuard }],
})
export class AuthModule {}
