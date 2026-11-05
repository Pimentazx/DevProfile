import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import {
  IntegrationProvider,
  SyncResource,
} from '@prisma/client';

export class CreateSyncDto {
  @ApiProperty({
    description: 'Provedor responsável pela sincronização',
    enum: IntegrationProvider,
    example: IntegrationProvider.GITHUB,
  })
  @IsEnum(IntegrationProvider)
  provider: IntegrationProvider;

  @ApiProperty({
    description: 'Recurso que será sincronizado',
    enum: SyncResource,
    example: SyncResource.GITHUB_REPOSITORIES,
  })
  @IsEnum(SyncResource)
  resource: SyncResource;
}