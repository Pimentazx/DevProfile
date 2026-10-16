import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';

@Injectable()
export class EducationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.education.findMany({
      where: {
        profile: { userId },
      },
      orderBy: [
        { order: 'asc' },
        { startDate: 'desc' },
      ],
    });
  }

  async findOne(userId: string, id: string) {
    const education = await this.prisma.education.findFirst({
      where: {
        id,
        profile: { userId },
      },
    });

    if (!education) {
      throw new NotFoundException(
        'Formação acadêmica não encontrada.',
      );
    }

    return education;
  }

  async create(userId: string, dto: CreateEducationDto) {
    this.validateDates(dto.startDate, dto.endDate, dto.current);

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado.');
    }

    return this.prisma.education.create({
      data: {
        institution: dto.institution.trim(),
        course: dto.course.trim(),
        degree: dto.degree,
        description: dto.description?.trim(),
        startDate: new Date(dto.startDate),
        endDate: dto.current || !dto.endDate
          ? null
          : new Date(dto.endDate),
        current: dto.current,
        order: dto.order ?? 0,
        profileId: profile.id,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateEducationDto,
  ) {
    const education = await this.findOne(userId, id);

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : education.startDate;

    const current = dto.current ?? education.current;

    const endDate = dto.endDate !== undefined
      ? new Date(dto.endDate)
      : education.endDate;

    if (current && dto.endDate) {
      throw new BadRequestException(
        'Uma formação em andamento não pode ter data de término.',
      );
    }

    const effectiveEndDate = current ? null : endDate;

    if (
      effectiveEndDate &&
      effectiveEndDate < startDate
    ) {
      throw new BadRequestException(
        'A data de término não pode ser anterior à data de início.',
      );
    }

    return this.prisma.education.update({
      where: { id: education.id },
      data: {
        ...(dto.institution !== undefined && {
          institution: dto.institution.trim(),
        }),
        ...(dto.course !== undefined && {
          course: dto.course.trim(),
        }),
        ...(dto.degree !== undefined && {
          degree: dto.degree,
        }),
        ...(dto.description !== undefined && {
          description: dto.description.trim(),
        }),
        ...(dto.startDate !== undefined && {
          startDate,
        }),
        ...(dto.endDate !== undefined || dto.current !== undefined
          ? { endDate: effectiveEndDate }
          : {}),
        ...(dto.current !== undefined && { current }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const education = await this.findOne(userId, id);

    await this.prisma.education.delete({
      where: { id: education.id },
    });

    return { message: 'Formação excluída com sucesso.' };
  }

  private validateDates(
    startDateValue: string,
    endDateValue: string | undefined,
    current: boolean,
  ) {
    const startDate = new Date(startDateValue);

    if (current && endDateValue) {
      throw new BadRequestException(
        'Uma formação em andamento não pode ter data de término.',
      );
    }

    if (
      endDateValue &&
      new Date(endDateValue) < startDate
    ) {
      throw new BadRequestException(
        'A data de término não pode ser anterior à data de início.',
      );
    }
  }
}