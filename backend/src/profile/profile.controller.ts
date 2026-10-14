import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Consultar meu perfil profissional' })
  findMyProfile(
    @Req() req: { user: { userId: string } },
  ) {
    return this.profileService.findMyProfile(
      req.user.userId,
    );
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar meu perfil profissional' })
  updateMyProfile(
    @Req() req: { user: { userId: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateMyProfile(
      req.user.userId,
      dto,
    );
  }
}