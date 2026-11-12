import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createMockFunction } from '../test-utils/mock-function';
import { UsersService } from './users.service';

describe('UsersService', () => {
  it('creates a user with a nested profile and selected public fields', async () => {
    const createdUser = { id: 'user-1', email: 'person@example.test' };
    const existingUser: { id: string } | null = null;
    const findUnique = createMockFunction(async (_args: unknown) => existingUser);
    const create = createMockFunction(async (_args: unknown) => createdUser);
    const prisma = {
      user: { findUnique: findUnique.fn, create: create.fn },
    } as unknown as PrismaService;
    const service = new UsersService(prisma);

    await expect(
      service.createUser('person@example.test', 'hashed-password', 'Person'),
    ).resolves.toBe(createdUser);

    expect(findUnique.calls[0][0]).toEqual({
      where: { email: 'person@example.test' },
    });
    expect(create.calls[0][0]).toMatchObject({
      data: {
        email: 'person@example.test',
        passwordHash: 'hashed-password',
        profile: { create: { fullName: 'Person' } },
      },
      select: { id: true, email: true, profile: { select: { fullName: true } } },
    });
  });

  it('rejects duplicate email addresses', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => ({ id: 'existing' }));
    const create = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      user: { findUnique: findUnique.fn, create: create.fn },
    } as unknown as PrismaService;
    const service = new UsersService(prisma);

    await expect(
      service.createUser('person@example.test', 'hash', 'Person'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(create.calls).toHaveLength(0);
  });

  it('returns not found when looking up a missing user ID', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => null);
    const prisma = { user: { findUnique: findUnique.fn } } as unknown as PrismaService;
    const service = new UsersService(prisma);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
