
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { ProjectType, ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({
    example: 'DevProfile',
    description: 'Nome do projeto',
    maxLength: 150,
  })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({
    example: 'devprofile',
    description: 'Slug único dentro do perfil do usuário',
    maxLength: 180,
  })
  @IsString()
  @MaxLength(180)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug deve conter letras minúsculas, números e hífens.',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'Plataforma para gerenciar currículo e portfólio.',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @ApiPropertyOptional({
    example: 'Projeto pessoal desenvolvido com NestJS e PostgreSQL.',
    maxLength: 10000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @ApiProperty({
    enum: ProjectType,
    example: ProjectType.PERSONAL,
    description: 'Categoria do projeto',
  })
  @IsEnum(ProjectType)
  type: ProjectType;

  @ApiPropertyOptional({
    enum: ProjectStatus,
    example: ProjectStatus.IN_PROGRESS,
    default: ProjectStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({
    example: '2026-10-07T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-12-31T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'https://github.com/Pimentazx/DevProfile',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  githubUrl?: string;

  @ApiPropertyOptional({
    example: 'https://devprofile.example.com',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  liveUrl?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/project-cover.png',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    example: [],
    description: 'IDs das habilidades cadastradas para associar ao projeto',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  skillIds?: string[];
}
