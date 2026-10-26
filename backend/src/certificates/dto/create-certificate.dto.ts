
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({
    description: 'Nome do certificado',
    example: 'Full-Stack Developer',
    maxLength: 150,
  })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({
    description: 'Instituição responsável pela emissão',
    example: 'FIAP',
    maxLength: 150,
  })
  @IsString()
  @MaxLength(150)
  issuer: string;

  @ApiProperty({
    description: 'Data de emissão do certificado',
    example: '2026-02-28T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  issueDate: string;

  @ApiPropertyOptional({
    description: 'Data de validade do certificado, quando aplicável',
    example: '2028-02-28T00:00:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string | null;

  @ApiPropertyOptional({
    description: 'Código ou identificador da credencial',
    example: 'CERT-2026-001',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  credentialId?: string;

  @ApiPropertyOptional({
    description: 'URL para verificar o certificado',
    example: 'https://example.com/certificado',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  credentialUrl?: string;

  @ApiPropertyOptional({
    description: 'Descrição ou detalhes adicionais',
    example: 'Certificação em desenvolvimento Full Stack.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição do certificado',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
