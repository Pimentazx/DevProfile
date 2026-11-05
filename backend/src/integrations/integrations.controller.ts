
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
import { CreateIntegrationDto } from './dto/create-integrations.dto';
import { UpdateIntegrationDto } from './dto/update-integrations.dto';
import { IntegrationsService } from './integrations.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('Integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar integrações do usuário' })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.integrationsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar integração por ID' })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.integrationsService.findOne(req.user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar integração' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateIntegrationDto,
  ) {
    return this.integrationsService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar integração' })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.update(
      req.user.userId,
      id,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover integração' })
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.integrationsService.remove(req.user.userId, id);
  }
}
