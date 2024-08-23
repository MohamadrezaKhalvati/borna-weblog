import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Role } from '../entities/user.entity';
import { TokenGuardData } from './token.guard';

export class IsAdmin implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const tokenData: TokenGuardData = request.headers._tokenGuard;
    let result = false;

    if (tokenData.user?.role === Role.Admin) result = true;
    else {
      if (tokenData.tokenError) {
        throw new BadRequestException('Not Authorized');
      }
    }

    return result;
  }
}
