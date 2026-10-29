
import { PartialType } from '@nestjs/swagger';
import { CreateSocialLinkDto } from './create-social-links.dto';

export class UpdateSocialLinkDto extends PartialType(
  CreateSocialLinkDto,
) {}
