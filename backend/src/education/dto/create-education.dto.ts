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
import { DegreeType } from '@prisma/client';

export class CreateEducationDto {
  @ApiProperty({ example: 'Universidade São Judas Tadeu' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  institution: string;

  @ApiProperty({ example: 'Engenharia de Software' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  course: string;

  @ApiProperty({
    enum: DegreeType,
    example: DegreeType.BACHELOR,
  })
  @IsEnum(DegreeType)
  degree: DegreeType;

  @ApiPropertyOptional({
    example: 'Formação voltada ao desenvolvimento de software.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string;

  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    example: '2028-12-01',
    description: 'Não enviar quando current for true.',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: true, default: false })
  @IsBoolean()
  current = false;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}