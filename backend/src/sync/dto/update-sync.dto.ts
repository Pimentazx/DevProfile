import { PartialType } from '@nestjs/swagger';
import { CreateSyncDto } from './create-sync.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { SyncStatus } from '@prisma/client';

export class UpdateSyncDto extends PartialType(CreateSyncDto) {
  @ApiPropertyOptional({
    description: 'Status atual da sincronização',
    enum: SyncStatus,
    example: SyncStatus.RUNNING,
  })
  @IsOptional()
  @IsEnum(SyncStatus)
  status?: SyncStatus;

  @ApiPropertyOptional({
    description: 'Data e hora em que a sincronização começou',
    example: '2026-11-05T12:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({
    description: 'Data e hora em que a sincronização terminou',
    example: '2026-11-05T12:05:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({
    description: 'Mensagem de erro, caso a sincronização falhe',
    example: 'Não foi possível acessar a API do GitHub.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  errorMessage?: string;
}