
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialLinkDto } from './dto/create-social-links.dto';
import { UpdateSocialLinkDto } from './dto/update-social-links.dto';

@Injectable()
export class SocialLinksService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException(
        'Perfil não encontrado. Atualize seu perfil antes de cadastrar links.',
      );
    }

    return profile.id;
  }

  async findAll(userId: string) {
    const profileId = await this.getProfileId(userId);

    return this.prisma.socialLink.findMany({
      where: { profileId },
      orderBy: [{ order: 'asc' }, { platform: 'asc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const profileId = await this.getProfileId(userId);

    const socialLink = await this.prisma.socialLink.findFirst({
      where: { id, profileId },
    });

    if (!socialLink) {
      throw new NotFoundException('Link social não encontrado.');
    }

    return socialLink;
  }

  async create(userId: string, dto: CreateSocialLinkDto) {
    const profileId = await this.getProfileId(userId);

    return this.prisma.socialLink.create({
      data: {
        profileId,
        platform: dto.platform,
        url: dto.url,
        username: dto.username,
        order: dto.order ?? 0,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateSocialLinkDto,
  ) {
    const socialLink = await this.findOne(userId, id);

    return this.prisma.socialLink.update({
      where: { id: socialLink.id },
      data: {
        ...(dto.platform !== undefined && {
          platform: dto.platform,
        }),
        ...(dto.url !== undefined && { url: dto.url }),
        ...(dto.username !== undefined && {
          username: dto.username,
        }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const socialLink = await this.findOne(userId, id);

    await this.prisma.socialLink.delete({
      where: { id: socialLink.id },
    });

    return { message: 'Link social excluído com sucesso.' };
  }
}
