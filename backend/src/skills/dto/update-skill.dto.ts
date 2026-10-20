import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SkillLevel } from '@prisma/client';

export class UpdateSkillDto {
  @ApiPropertyOptional({
    enum: SkillLevel,
    example: SkillLevel.EXPERT,
  })
  @IsOptional()
  @IsEnum(SkillLevel)
  level?: SkillLevel;

  @ApiPropertyOptional({ example: 1, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}