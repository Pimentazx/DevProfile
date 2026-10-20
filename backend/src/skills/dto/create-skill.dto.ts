import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { SkillCategory, SkillLevel } from '@prisma/client';

export class CreateSkillDto {
  @ApiProperty({ example: 'React' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    enum: SkillCategory,
    example: SkillCategory.FRONTEND,
  })
  @IsEnum(SkillCategory)
  category: SkillCategory;

  @ApiPropertyOptional({
    enum: SkillLevel,
    example: SkillLevel.ADVANCED,
  })
  @IsOptional()
  @IsEnum(SkillLevel)
  level?: SkillLevel;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}