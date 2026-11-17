import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createMockFunction } from '../../test/mock-function';
import { IntegrationsService } from './integrations.service';

describe('IntegrationsService', () => {
  it('selects only public integration fields when listing connections', async () => {
    const integrations = [{ id: 'integration-1', provider: 'GITHUB' }];
    const findMany = createMockFunction(async (_args: unknown) => integrations);
    const prisma = {
      integration: { findMany: findMany.fn },
    } as unknown as PrismaService;
    const service = new IntegrationsService(prisma);

    await expect(service.findAll('user-1')).resolves.toBe(integrations);
    const query = findMany.calls[0][0] as {
      where: unknown;
      select: Record<string, boolean>;
    };
    expect(query.where).toEqual({ userId: 'user-1' });
    expect(query.select).toMatchObject({
      id: true,
      provider: true,
      expiresAt: true,
    });
    expect(query.select).not.toHaveProperty('accessToken');
    expect(query.select).not.toHaveProperty('refreshToken');
  });

  it('maps duplicate provider integrations to a conflict response', async () => {
    const duplicateProvider = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '7.10.0' },
    );
    const create = createMockFunction(async (_args: unknown) => {
      throw duplicateProvider;
    });
    const prisma = {
      integration: { create: create.fn },
    } as unknown as PrismaService;
    const service = new IntegrationsService(prisma);

    await expect(
      service.create('user-1', { provider: 'GITHUB', accessToken: 'secret' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('does not update an integration that does not belong to the user', async () => {
    const findFirst = createMockFunction(async (_args: unknown) => null);
    const update = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      integration: { findFirst: findFirst.fn, update: update.fn },
    } as unknown as PrismaService;
    const service = new IntegrationsService(prisma);

    await expect(
      service.update('user-2', 'integration-1', { accessToken: 'new-secret' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(findFirst.calls[0][0]).toMatchObject({
      where: { id: 'integration-1', userId: 'user-2' },
    });
    expect(update.calls).toHaveLength(0);
  });
});
