
import { PartialType } from '@nestjs/swagger';
import { CreateIntegrationDto } from './create-integrations.dto';

export class UpdateIntegrationDto extends PartialType(
  CreateIntegrationDto,
) {}
