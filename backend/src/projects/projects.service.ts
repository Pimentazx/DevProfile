
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException(
        'Perfil não encontrado. Atualize seu perfil antes de cadastrar projetos.',
      );
    }

    return profile.id;
  }

  private async validateSkills(skillIds?: string[]) {
    if (!skillIds?.length) return;

    const skills = await this.prisma.skill.findMany({
      where: { id: { in: skillIds } },
      select: { id: true },
    });

    if (skills.length !== skillIds.length) {
      throw new BadRequestException(
        'Uma ou mais habilidades informadas não existem.',
      );
    }
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Já existe um projeto com esse slug no seu perfil.',
      );
    }

    throw error;
  }

  async findAll(userId: string) {
    const profileId = await this.getProfileId(userId);

    return this.prisma.project.findMany({
      where: { profileId },
      include: {
        skills: {
          include: { skill: true },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const profileId = await this.getProfileId(userId);

    const project = await this.prisma.project.findFirst({
      where: { id, profileId },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado.');
    }

    return project;
  }

  async create(userId: string, dto: CreateProjectDto) {
    const profileId = await this.getProfileId(userId);

    await this.validateSkills(dto.skillIds);

    try {
      return await this.prisma.project.create({
        data: {
          profileId,
          name: dto.name,
          slug: dto.slug,
          shortDescription: dto.shortDescription,
          description: dto.description,
          type: dto.type,
          status: dto.status,
          startDate: dto.startDate
            ? new Date(dto.startDate)
            : null,
          endDate: dto.endDate
            ? new Date(dto.endDate)
            : null,
          githubUrl: dto.githubUrl,
          liveUrl: dto.liveUrl,
          imageUrl: dto.imageUrl,
          featured: dto.featured,
          order: dto.order ?? 0,
          skills: {
            create: (dto.skillIds ?? []).map((skillId) => ({
              skill: { connect: { id: skillId } },
            })),
          },
        },
        include: {
          skills: {
            include: { skill: true },
          },
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateProjectDto,
  ) {
    const project = await this.findOne(userId, id);

    if (dto.skillIds !== undefined) {
      await this.validateSkills(dto.skillIds);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.skillIds !== undefined) {
          await tx.projectSkill.deleteMany({
            where: { projectId: project.id },
          });
        }

        return tx.project.update({
          where: { id: project.id },
          data: {
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.slug !== undefined && { slug: dto.slug }),
            ...(dto.shortDescription !== undefined && {
              shortDescription: dto.shortDescription,
            }),
            ...(dto.description !== undefined && {
              description: dto.description,
            }),
            ...(dto.type !== undefined && { type: dto.type }),
            ...(dto.status !== undefined && { status: dto.status }),
            ...(dto.startDate !== undefined && {
              startDate: dto.startDate
                ? new Date(dto.startDate)
                : null,
            }),
            ...(dto.endDate !== undefined && {
              endDate: dto.endDate
                ? new Date(dto.endDate)
                : null,
            }),
            ...(dto.githubUrl !== undefined && {
              githubUrl: dto.githubUrl,
            }),
            ...(dto.liveUrl !== undefined && {
              liveUrl: dto.liveUrl,
            }),
            ...(dto.imageUrl !== undefined && {
              imageUrl: dto.imageUrl,
            }),
            ...(dto.featured !== undefined && {
              featured: dto.featured,
            }),
            ...(dto.order !== undefined && { order: dto.order }),
            ...(dto.skillIds !== undefined && {
              skills: {
                create: dto.skillIds.map((skillId) => ({
                  skill: { connect: { id: skillId } },
                })),
              },
            }),
          },
          include: {
            skills: {
              include: { skill: true },
            },
          },
        });
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(userId: string, id: string) {
    const project = await this.findOne(userId, id);

    await this.prisma.project.delete({
      where: { id: project.id },
    });

    return { message: 'Projeto excluído com sucesso.' };
  }
}
