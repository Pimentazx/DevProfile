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
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillsService } from './skills.service';

@ApiTags('Skills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('skills')
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar minhas habilidades' })
  findAll(@Req() req: { user: { userId: string } }) {
    return this.skillsService.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Adicionar uma habilidade ao meu perfil' })
  create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateSkillDto,
  ) {
    return this.skillsService.create(req.user.userId, dto);
  }

  @Patch(':skillId')
  @ApiOperation({ summary: 'Atualizar nível ou ordem de uma habilidade' })
  update(
    @Req() req: { user: { userId: string } },
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.skillsService.update(
      req.user.userId,
      skillId,
      dto,
    );
  }

  @Delete(':skillId')
  @ApiOperation({ summary: 'Remover uma habilidade do meu perfil' })
  remove(
    @Req() req: { user: { userId: string } },
    @Param('skillId', ParseUUIDPipe) skillId: string,
  ) {
    return this.skillsService.remove(
      req.user.userId,
      skillId,
    );
  }
}