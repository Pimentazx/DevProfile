import { Module } from '@nestjs/common';
import { SocialLinksService } from './social-links.service';
import { SocialLinksController } from './social-links.controller';

@Module({
  providers: [SocialLinksService],
  controllers: [SocialLinksController]
})
export class SocialLinksModule {}
