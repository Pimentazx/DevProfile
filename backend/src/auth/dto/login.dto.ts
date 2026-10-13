import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'teste@devprofile.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SenhaForte123',
    minLength: 8,
    maxLength: 72,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}