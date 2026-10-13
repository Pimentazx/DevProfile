import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'teste@devprofile.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Usuário de Teste' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

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