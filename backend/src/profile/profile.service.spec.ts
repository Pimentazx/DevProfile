import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createMockFunction } from '../../test/mock-function';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  it('loads a profile with its skill associations', async () => {
    const profile = { id: 'profile-1', userId: 'user-1', skills: [] };
    const findUnique = createMockFunction(async (_args: unknown) => profile);
    const prisma = { profile: { findUnique: findUnique.fn } } as unknown as PrismaService;
    const service = new ProfileService(prisma);

    await expect(service.findMyProfile('user-1')).resolves.toBe(profile);
    expect(findUnique.calls[0][0]).toEqual({
      where: { userId: 'user-1' },
      include: { skills: { include: { skill: true } } },
    });
  });

  it('updates profile data only when the profile exists', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => ({ id: 'profile-1' }));
    const updated = { id: 'profile-1', fullName: 'New Name' };
    const update = createMockFunction(async (_args: unknown) => updated);
    const prisma = {
      profile: { findUnique: findUnique.fn, update: update.fn },
    } as unknown as PrismaService;
    const service = new ProfileService(prisma);

    await expect(
      service.updateMyProfile('user-1', { fullName: 'New Name' }),
    ).resolves.toBe(updated);
    expect(update.calls[0][0]).toEqual({
      where: { userId: 'user-1' },
      data: { fullName: 'New Name' },
    });
  });

  it('raises not found when the profile is missing', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => null);
    const update = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: findUnique.fn, update: update.fn },
    } as unknown as PrismaService;
    const service = new ProfileService(prisma);

    await expect(
      service.updateMyProfile('missing-user', { fullName: 'Name' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(update.calls).toHaveLength(0);
  });
});
