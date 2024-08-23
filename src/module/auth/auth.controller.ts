import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserInput } from './dto/create-user.input';
import { LoginInput } from './dto/login.input';
import { UpdateUserRoleInput } from './dto/update-user.input';

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

  @Post('login')
  @ApiOperation({ operationId: 'login', summary: 'Login a user' })
  @ApiBody({ type: LoginInput })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in',
  })
  async login(@Body() input: LoginInput) {}

  @Put('updateUserRole')
  @ApiOperation({
    operationId: 'UpdateUserRole',
    summary: 'Update a user role',
  })
  async updateUserRole(@Body() input: UpdateUserRoleInput) {
    return await this.authService.updateUserRole(input);
  }
}
