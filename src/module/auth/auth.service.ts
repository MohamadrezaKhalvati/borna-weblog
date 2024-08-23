import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { cleanDeep } from 'src/common/clean-deep';
import { Repository } from 'typeorm';
import { NodeMailerService } from '../node-mailer/node-mailer.service';
import { SubmitChangePasswordInput } from './dto/change-password.input';
import { CreateUserInput } from './dto/create-user.input';
import { LoginInput } from './dto/login.input';
import { SendChangePasswordCodeInput } from './dto/send-change-password-code.input';
import { UpdateUserInput } from './dto/update-user.input';
import { VerifyCodeInput } from './dto/verify-code.input';
import { Role, User } from './entities/user.entity';
import { JwtPayloadType } from './guards/token.guard';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private nodeMailerService: NodeMailerService,
    private jwt: JwtService,
  ) {}

  async createUser(input: CreateUserInput) {
    const { email, username } = input;
    await this.verifyIsEmailUnique(email);
    await this.verifyIsUsernameUniqe(username);
    const userCount = await this.userRepository.count();

    let user: User;

    if (userCount === 0) {
      // Create admin user
      user = this.userRepository.create({ ...input, role: Role.Admin });
    } else {
      // Create regular user
      user = this.userRepository.create({ ...input, role: Role.User });
    }

    const verifyNumber = this.generateRandomNummber();

    await this.cacheService.set(`verificationCode:${email}`, verifyNumber, {
      ttl: 100,
    });

    await this.nodeMailerService.sendVerificationEmail(email, verifyNumber);

    return await this.userRepository.save(user);
  }

  async verifyUserCode(input: VerifyCodeInput) {
    const { email, verificationCode } = input;
    const cachedCode = await this.cacheService.get<string>(
      `verificationCode:${email}`,
    );

    if (!cachedCode) {
      throw new NotFoundException('Verification code not found or expired');
    }

    if (cachedCode !== verificationCode) {
      throw new BadRequestException('Invalid verification code');
    }

    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.verifyed = true;
    await this.userRepository.save(user);
    await this.cacheService.del(`verificationCode:${email}`);

    return user;
  }

  private generateRandomNummber() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  private async verifyIsUsernameUniqe(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user) {
      throw new BadRequestException('Username already exists');
    }
  }

  private async verifyIsEmailUnique(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new BadRequestException('Email already exists');
    }
  }

  async createHashedPassword(mainPassword: string) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(mainPassword, saltOrRounds);
    return hash;
  }

  async verifyUserForLogin(input: LoginInput) {
    const { email, password } = input;
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new NotFoundException('password is not correct');

    return user;
  }

  async login(input: LoginInput) {
    const user = await this.verifyUserForLogin(input);
    const payload: JwtPayloadType = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const token = await this.signPayload(payload);

    return { token };
  }

  private signPayload(input: JwtPayloadType) {
    return this.jwt.sign(input);
  }

  private async verifyIfUserExistance(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User with this id does not exist');
    }
    return user;
  }

  async updateUser(input: UpdateUserInput) {
    const { id } = input;

    const user = await this.verifyIfUserExistance(id);

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const computedData = cleanDeep(input);
    const updatedUser = await this.userRepository.save({
      ...user,
      ...computedData,
    });

    return updatedUser;
  }

  async sendChangePasswordCode(input: SendChangePasswordCodeInput) {
    const { email } = input;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }
    const verifyNumber = this.generateRandomNummber();
    await this.cacheService.set(`changePasswordCode:${email}`, verifyNumber, {
      ttl: 100,
    });

    await this.nodeMailerService.sendChangePasswordEmail(email, verifyNumber);

    return {
      message: 'Code has been sent to your email',
      email: email,
    };
  }

  async submitChangePassowrd(input: SubmitChangePasswordInput) {
    const { email, newPassword, code } = input;
    const cachedCode = await this.cacheService.get<string>(
      `changePasswordCode:${email}`,
    );

    if (!cachedCode) {
      throw new NotFoundException('Verification code not found or expired');
    }

    if (cachedCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await this.createHashedPassword(newPassword);

    user.password = hashedPassword;

    await this.userRepository.save(user);

    return {
      message: 'Password changed successfully',
    };
  }
}
