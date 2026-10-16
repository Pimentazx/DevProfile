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
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { EducationService } from './education.service';

@ApiTags('Education')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('education')
export class EducationController {
  constructor(
    private readonly educationService: EducationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar minhas formações acadêmicas' })
  findAll(@Req() req: { user: { userId: string } }) {
    return this.educationService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar uma formação acadêmica' })
  findOne(
    @Req() req: { user: { userId: string } },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.educationService.findOne(req.user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar uma formação acadêmica' })
  create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateEducationDto,
  ) {
    return this.educationService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma formação acadêmica' })
  update(
    @Req() req: { user: { userId: string } },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEducationDto,
  ) {
    return this.educationService.update(
      req.user.userId,
      id,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma formação acadêmica' })
  remove(
    @Req() req: { user: { userId: string } },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.educationService.remove(req.user.userId, id);
  }
}