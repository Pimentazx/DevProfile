
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { SocialPlatform } from '@prisma/client';

export class CreateSocialLinkDto {
  @ApiProperty({
    description: 'Plataforma do link social',
    enum: SocialPlatform,
    example: SocialPlatform.GITHUB,
  })
  @IsEnum(SocialPlatform)
  platform: SocialPlatform;

  @ApiProperty({
    description: 'URL pública do perfil ou site',
    example: 'https://github.com/Pimentazx',
    maxLength: 500,
  })
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({
    description: 'Nome de usuário na plataforma',
    example: 'Pimentazx',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição do link',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
