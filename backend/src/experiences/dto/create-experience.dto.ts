import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { EmploymentType } from '@prisma/client';

export class CreateExperienceDto {
  @ApiProperty({ example: 'Empresa Exemplo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  company: string;

  @ApiProperty({ example: 'Desenvolvedor Full Stack' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  role: string;

  @ApiPropertyOptional({
    example: 'Desenvolvimento de aplicações web e APIs REST.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string;

  @ApiProperty({
    enum: EmploymentType,
    example: EmploymentType.INTERNSHIP,
  })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiPropertyOptional({ example: 'São Paulo, SP' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;

  @ApiProperty({ example: '2023-03-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    example: '2024-11-30',
    description: 'Não enviar quando current for true.',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  current: boolean = false;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}