
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSocialLinkDto } from './dto/create-social-links.dto';
import { UpdateSocialLinkDto } from './dto/update-social-links.dto';
import { SocialLinksService } from './social-links.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('Social Links')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('social-links')
export class SocialLinksController {
  constructor(
    private readonly socialLinksService: SocialLinksService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar links sociais do usuário' })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.socialLinksService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar link social por ID' })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.socialLinksService.findOne(req.user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar link social' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateSocialLinkDto,
  ) {
    return this.socialLinksService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar link social' })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSocialLinkDto,
  ) {
    return this.socialLinksService.update(
      req.user.userId,
      id,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir link social' })
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.socialLinksService.remove(req.user.userId, id);
  }
}
