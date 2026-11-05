
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIntegrationDto } from './dto/create-integrations.dto';
import { UpdateIntegrationDto } from './dto/update-integrations.dto';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Campos públicos: os tokens nunca são retornados.
  private readonly publicSelect = {
    id: true,
    userId: true,
    provider: true,
    expiresAt: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.IntegrationSelect;

  async findAll(userId: string) {
    return this.prisma.integration.findMany({
      where: { userId },
      select: this.publicSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id, userId },
      select: this.publicSelect,
    });

    if (!integration) {
      throw new NotFoundException('Integração não encontrada.');
    }

    return integration;
  }

  async create(userId: string, dto: CreateIntegrationDto) {
    try {
      return await this.prisma.integration.create({
        data: {
          userId,
          provider: dto.provider,
          accessToken: dto.accessToken,
          refreshToken: dto.refreshToken,
          expiresAt: dto.expiresAt
            ? new Date(dto.expiresAt)
            : null,
          metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        },
        select: this.publicSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Você já possui uma integração cadastrada para esse provedor.',
        );
      }

      throw error;
    }
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateIntegrationDto,
  ) {
    await this.findOne(userId, id);

    return this.prisma.integration.update({
      where: { id },
      data: {
        ...(dto.provider !== undefined && {
          provider: dto.provider,
        }),
        ...(dto.accessToken !== undefined && {
          accessToken: dto.accessToken,
        }),
        ...(dto.refreshToken !== undefined && {
          refreshToken: dto.refreshToken,
        }),
        ...(dto.expiresAt !== undefined && {
          expiresAt: dto.expiresAt
            ? new Date(dto.expiresAt)
            : null,
        }),
        ...(dto.metadata !== undefined && {
          metadata: dto.metadata as Prisma.InputJsonValue,
        }),
      },
      select: this.publicSelect,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.integration.delete({
      where: { id },
    });

    return {
      message: 'Integração removida com sucesso.',
    };
  }
}
