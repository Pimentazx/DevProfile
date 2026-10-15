import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@Injectable()
export class ExperiencesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.experience.findMany({
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
    const experience = await this.prisma.experience.findFirst({
      where: {
        id,
        profile: { userId },
      },
    });

    if (!experience) {
      throw new NotFoundException(
        'Experiência profissional não encontrada.',
      );
    }

    return experience;
  }

  async create(userId: string, dto: CreateExperienceDto) {
    this.validateDates(dto.startDate, dto.endDate, dto.current);

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado.');
    }

    return this.prisma.experience.create({
      data: {
        company: dto.company.trim(),
        role: dto.role.trim(),
        description: dto.description?.trim(),
        employmentType: dto.employmentType,
        location: dto.location?.trim(),
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
    dto: UpdateExperienceDto,
  ) {
    const experience = await this.findOne(userId, id);

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : experience.startDate;

    const current = dto.current ?? experience.current;

    const endDate = dto.endDate !== undefined
      ? new Date(dto.endDate)
      : experience.endDate;

    if (current && dto.endDate) {
      throw new BadRequestException(
        'Uma experiência atual não pode ter data de término.',
      );
    }

    if (current && dto.current === true) {
      // A experiência passou a ser atual; não há data de término.
    }

    const effectiveEndDate = current
      ? null
      : endDate;

    if (
      effectiveEndDate &&
      effectiveEndDate < startDate
    ) {
      throw new BadRequestException(
        'A data de término não pode ser anterior à data de início.',
      );
    }

    return this.prisma.experience.update({
      where: { id: experience.id },
      data: {
        ...(dto.company !== undefined && {
          company: dto.company.trim(),
        }),
        ...(dto.role !== undefined && {
          role: dto.role.trim(),
        }),
        ...(dto.description !== undefined && {
          description: dto.description.trim(),
        }),
        ...(dto.employmentType !== undefined && {
          employmentType: dto.employmentType,
        }),
        ...(dto.location !== undefined && {
          location: dto.location.trim(),
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
    const experience = await this.findOne(userId, id);

    await this.prisma.experience.delete({
      where: { id: experience.id },
    });

    return { message: 'Experiência excluída com sucesso.' };
  }

  private validateDates(
    startDateValue: string,
    endDateValue: string | undefined,
    current: boolean,
  ) {
    const startDate = new Date(startDateValue);

    if (current && endDateValue) {
      throw new BadRequestException(
        'Uma experiência atual não pode ter data de término.',
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