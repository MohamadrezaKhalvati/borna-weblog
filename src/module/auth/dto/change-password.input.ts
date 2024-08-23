import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SubmitChangePasswordInput {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  newPassword: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;
}
