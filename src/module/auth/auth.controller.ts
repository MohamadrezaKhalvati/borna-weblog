import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Roles } from './decorator/roles.decorator';
import { SubmitChangePasswordInput } from './dto/change-password.input';
import { CreateUserInput } from './dto/create-user.input';
import { LoginInput } from './dto/login.input';
import { SendChangePasswordCodeInput } from './dto/send-change-password-code.input';
import { UpdateUserInput } from './dto/update-user.input';
import { VerifyCodeInput } from './dto/verify-code.input';
import { Role } from './entities/user.entity';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ operationId: 'Register', summary: 'Register a new user' })
  @ApiBody({ type: CreateUserInput })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully registered',
  })
  async createUser(@Body() input: CreateUserInput) {
    return await this.authService.createUser(input);
  }

  @Post('verify')
  @ApiOperation({ operationId: 'VerifyUser', summary: 'Verify a user' })
  @ApiBody({ type: VerifyCodeInput })
  async verifyUser(@Body() input: VerifyCodeInput) {
    const user = await this.authService.verifyUserCode(input);
    return {
      message: 'User verified successfully',
    };
  }
  @Post('login')
  @ApiOperation({ operationId: 'login', summary: 'Login a user' })
  @ApiBody({ type: LoginInput })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in',
  })
  async login(@Body() input: LoginInput) {
    return await this.authService.login(input);
  }

  @Put('updateUser')
  @ApiOperation({
    operationId: 'updateUser',
    summary: 'Update a user ',
  })
  @ApiBody({ type: UpdateUserInput })
  @ApiResponse({ status: 200, description: 'User  updated successfully' })
  @Roles(Role.Admin)
  async updateUser(@Body() input: UpdateUserInput) {
    return await this.authService.updateUser(input);
  }

  @Post('sendChangePasswordCode')
  @ApiOperation({ operationId: 'sendChangePasswordCode' })
  @ApiBody({ type: SendChangePasswordCodeInput })
  @ApiResponse({ status: 200, description: 'Code sent successfully' })
  async sendChangePasswordCode(@Body() input: SendChangePasswordCodeInput) {
    return await this.authService.sendChangePasswordCode(input);
  }

  @Post('submitChangePassword')
  @ApiOperation({ operationId: 'submitChangePassword' })
  @ApiBody({ type: SubmitChangePasswordInput })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async submitChangePassword(@Body() input: SubmitChangePasswordInput) {
    return await this.authService.submitChangePassowrd(input);
  }
}
