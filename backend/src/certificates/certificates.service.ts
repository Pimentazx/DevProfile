
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException(
        'Perfil não encontrado. Atualize seu perfil antes de cadastrar certificados.',
      );
    }

    return profile;
  }

  async findAll(userId: string) {
    const profile = await this.getProfile(userId);

    return this.prisma.certificate.findMany({
      where: { profileId: profile.id },
      orderBy: [{ order: 'asc' }, { issueDate: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const profile = await this.getProfile(userId);

    const certificate = await this.prisma.certificate.findFirst({
      where: { id, profileId: profile.id },
    });

    if (!certificate) {
      throw new NotFoundException('Certificado não encontrado.');
    }

    return certificate;
  }

  async create(userId: string, dto: CreateCertificateDto) {
    const profile = await this.getProfile(userId);

    return this.prisma.certificate.create({
      data: {
        profileId: profile.id,
        name: dto.name,
        issuer: dto.issuer,
        issueDate: new Date(dto.issueDate),
        expirationDate: dto.expirationDate
          ? new Date(dto.expirationDate)
          : null,
        credentialId: dto.credentialId,
        credentialUrl: dto.credentialUrl,
        description: dto.description,
        order: dto.order ?? 0,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCertificateDto,
  ) {
    const certificate = await this.findOne(userId, id);

    return this.prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.issuer !== undefined && { issuer: dto.issuer }),
        ...(dto.issueDate !== undefined && {
          issueDate: new Date(dto.issueDate),
        }),
        ...(dto.expirationDate !== undefined && {
          expirationDate: dto.expirationDate
            ? new Date(dto.expirationDate)
            : null,
        }),
        ...(dto.credentialId !== undefined && {
          credentialId: dto.credentialId,
        }),
        ...(dto.credentialUrl !== undefined && {
          credentialUrl: dto.credentialUrl,
        }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const certificate = await this.findOne(userId, id);

    await this.prisma.certificate.delete({
      where: { id: certificate.id },
    });

    return { message: 'Certificado excluído com sucesso.' };
  }
}
