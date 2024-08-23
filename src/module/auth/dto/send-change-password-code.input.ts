import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendChangePasswordCodeInput {
  @ApiProperty()
  @IsString()
  email: string;
}
