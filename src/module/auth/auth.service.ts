import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { LoginInput } from './dto/login.input';
import { UpdateUserRoleInput } from './dto/update-user.input';
import { Role, User } from './entities/user.entity';
import { JwtPayloadType } from './guards/token.guard';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
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

    // Save the user to the database
    return await this.userRepository.save(user);
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
        email: email.toLowerCase(),
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
      username: user.username.toLowerCase(),
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
  async updateUserRole(input: UpdateUserRoleInput) {
    const { id, role } = input;
    const user = await this.verifyIfUserExistance(id);

    user.role = role;
    return await this.userRepository.save(user);
  }
}
