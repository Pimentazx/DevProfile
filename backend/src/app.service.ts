import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello() {
    const users = await this.prisma.user.findMany();

    return {
      message: 'DevProfile API funcionando!',
      database: 'PostgreSQL conectado',
      users,
    };
  }
}