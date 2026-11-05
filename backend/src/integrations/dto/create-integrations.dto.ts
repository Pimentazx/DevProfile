
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IntegrationProvider } from '@prisma/client';

export class CreateIntegrationDto {
  @ApiProperty({
    description: 'Provedor da integração',
    enum: IntegrationProvider,
    example: IntegrationProvider.GITHUB,
  })
  @IsEnum(IntegrationProvider)
  provider: IntegrationProvider;

  @ApiProperty({
    description: 'Token de acesso da integração',
    example: 'ghp_example_token',
    writeOnly: true,
  })
  @IsString()
  @MaxLength(2000)
  accessToken: string;

  @ApiPropertyOptional({
    description: 'Token de atualização, quando fornecido pelo provedor',
    writeOnly: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  refreshToken?: string;

  @ApiPropertyOptional({
    description: 'Data de expiração do token',
    example: '2027-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Metadados adicionais da integração',
    example: { username: 'Pimentazx' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
