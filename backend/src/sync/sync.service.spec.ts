import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createMockFunction } from '../../test/mock-function';
import { SyncService } from './sync.service';

describe('SyncService', () => {
  it('creates a sync record for the requesting user', async () => {
    const created = { id: 'sync-1', userId: 'user-1' };
    const create = createMockFunction(async (_args: unknown) => created);
    const prisma = { sync: { create: create.fn } } as unknown as PrismaService;
    const service = new SyncService(prisma);

    await expect(
      service.create('user-1', {
        provider: 'GITHUB',
        resource: 'GITHUB_REPOSITORIES',
      }),
    ).resolves.toBe(created);
    expect(create.calls[0][0]).toEqual({
      data: {
        userId: 'user-1',
        provider: 'GITHUB',
        resource: 'GITHUB_REPOSITORIES',
      },
    });
  });

  it('does not return sync records belonging to another user', async () => {
    const findFirst = createMockFunction(async (_args: unknown) => null);
    const prisma = { sync: { findFirst: findFirst.fn } } as unknown as PrismaService;
    const service = new SyncService(prisma);

    await expect(service.findOne('user-2', 'sync-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(findFirst.calls[0][0]).toEqual({
      where: { id: 'sync-1', userId: 'user-2' },
    });
  });
});
