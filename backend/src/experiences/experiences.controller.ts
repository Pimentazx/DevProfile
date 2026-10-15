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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { ExperiencesService } from './experiences.service';

@ApiTags('Experiences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('experiences')
export class ExperiencesController {
  constructor(
    private readonly experiencesService: ExperiencesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar minhas experiências profissionais' })
  findAll(@Req() req: { user: { userId: string } }) {
    return this.experiencesService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar uma experiência profissional' })
  findOne(
    @Req() req: { user: { userId: string } },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.experiencesService.findOne(req.user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar uma experiência profissional' })
  create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateExperienceDto,
  ) {
    return this.experiencesService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma experiência profissional' })
  update(
    @Req() req: { user: { userId: string } },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.experiencesService.update(
      req.user.userId,
      id,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma experiência profissional' })
  remove(
    @Req() req: { user: { userId: string } },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.experiencesService.remove(req.user.userId, id);
  }
}