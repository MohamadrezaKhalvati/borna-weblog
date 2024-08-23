import { SetMetadata } from '@nestjs/common';
import { Role } from '../entities/user.entity';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
