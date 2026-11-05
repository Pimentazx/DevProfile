import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSyncDto } from './dto/create-sync.dto';
import { UpdateSyncDto } from './dto/update-sync.dto';
import { SyncService } from './sync.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('Sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  @ApiOperation({ summary: 'Listar histórico de sincronizações' })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.syncService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar sincronização por ID' })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.syncService.findOne(req.user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar uma nova sincronização' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateSyncDto,
  ) {
    return this.syncService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma sincronização' })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSyncDto,
  ) {
    return this.syncService.update(
      req.user.userId,
      id,
      dto,
    );
  }
}