import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
            headline: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async createUser(
    email: string,
    passwordHash: string,
    fullName: string,
  ) {
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            fullName,
          },
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
          },
        },
      },
    });
  }
}