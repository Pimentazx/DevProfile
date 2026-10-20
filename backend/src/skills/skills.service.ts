import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado.');
    }

    return profile.id;
  }

  async findAll(userId: string) {
    const profileId = await this.getProfileId(userId);

    const profileSkills = await this.prisma.profileSkill.findMany({
      where: { profileId },
      include: { skill: true },
      orderBy: { order: 'asc' },
    });

    return profileSkills.map(({ skill, level, order }) => ({
      ...skill,
      level,
      order,
    }));
  }

  async create(userId: string, dto: CreateSkillDto) {
    const profileId = await this.getProfileId(userId);
    const name = dto.name.trim();

    const existingSkill = await this.prisma.skill.findUnique({
      where: { name },
    });

    if (
      existingSkill &&
      existingSkill.category !== dto.category
    ) {
      throw new ConflictException(
        'Essa habilidade já existe com outra categoria.',
      );
    }

    const skill = existingSkill ?? await this.prisma.skill.create({
      data: {
        name,
        category: dto.category,
      },
    });

    try {
      await this.prisma.profileSkill.create({
        data: {
          profileId,
          skillId: skill.id,
          level: dto.level,
          order: dto.order ?? 0,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Essa habilidade já está associada ao seu perfil.',
        );
      }

      throw error;
    }

    return {
      ...skill,
      level: dto.level ?? null,
      order: dto.order ?? 0,
    };
  }

  async update(
    userId: string,
    skillId: string,
    dto: UpdateSkillDto,
  ) {
    const profileId = await this.getProfileId(userId);

    const association = await this.prisma.profileSkill.findUnique({
      where: {
        profileId_skillId: {
          profileId,
          skillId,
        },
      },
      include: { skill: true },
    });

    if (!association) {
      throw new NotFoundException(
        'Habilidade não encontrada no seu perfil.',
      );
    }

    const updated = await this.prisma.profileSkill.update({
      where: {
        profileId_skillId: {
          profileId,
          skillId,
        },
      },
      data: {
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
      include: { skill: true },
    });

    return {
      ...updated.skill,
      level: updated.level,
      order: updated.order,
    };
  }

  async remove(userId: string, skillId: string) {
    const profileId = await this.getProfileId(userId);

    const association = await this.prisma.profileSkill.findUnique({
      where: {
        profileId_skillId: {
          profileId,
          skillId,
        },
      },
    });

    if (!association) {
      throw new NotFoundException(
        'Habilidade não encontrada no seu perfil.',
      );
    }

    await this.prisma.profileSkill.delete({
      where: {
        profileId_skillId: {
          profileId,
          skillId,
        },
      },
    });

    return {
      message: 'Habilidade removida do perfil com sucesso.',
    };
  }
}