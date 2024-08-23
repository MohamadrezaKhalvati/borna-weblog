import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, User } from '../entities/user.entity';

export type TokenGuardData = {
  user?: {
    id: string;
    username: string;
    role: Role;
  };
  tokenError?: {
    name: string;
    message: string;
    date?: Date;
    expiredAt?: number;
  };
};

export type JwtPayloadType = {
  username: string;
  id: string;
  role: Role;
};

export class TokenGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => JwtService))
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'] || '';
    const token = authorization.replace('bearer ', '').replace('jwt ', '');

    try {
      const bodyData: JwtPayloadType = this.jwt.verify(token, {
        secret: process.env.JWT_SECRET_TOKEN,
      });
      const tokenData: TokenGuardData = {};
      if (bodyData) {
        const userId = bodyData.id;
        const foundUser = await this.userRepository.findOne({
          where: { id: userId },
        });

        if (foundUser) {
          tokenData.user = {
            role: foundUser.role,
            id: foundUser.id,
            username: foundUser.username,
          };
        }
        request.headers['_tokenGuard'] = tokenData;
      }
    } catch (tokenError) {
      const tokenData: TokenGuardData = { tokenError };
      request.headers['_tokenGuard'] = tokenData;
    }

    return true;
  }
}
