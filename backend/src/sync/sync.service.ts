import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncDto } from './dto/create-sync.dto';
import { UpdateSyncDto } from './dto/update-sync.dto';

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.sync.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const sync = await this.prisma.sync.findFirst({
      where: { id, userId },
    });

    if (!sync) {
      throw new NotFoundException(
        'Sincronização não encontrada.',
      );
    }

    return sync;
  }

  async create(userId: string, dto: CreateSyncDto) {
    return this.prisma.sync.create({
      data: {
        userId,
        provider: dto.provider,
        resource: dto.resource,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateSyncDto,
  ) {
    await this.findOne(userId, id);

    return this.prisma.sync.update({
      where: { id },
      data: {
        ...(dto.provider !== undefined && {
          provider: dto.provider,
        }),
        ...(dto.resource !== undefined && {
          resource: dto.resource,
        }),
        ...(dto.status !== undefined && {
          status: dto.status,
        }),
        ...(dto.startedAt !== undefined && {
          startedAt: new Date(dto.startedAt),
        }),
        ...(dto.completedAt !== undefined && {
          completedAt: new Date(dto.completedAt),
        }),
        ...(dto.errorMessage !== undefined && {
          errorMessage: dto.errorMessage,
        }),
      },
    });
  }
}