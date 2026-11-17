import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createMockFunction } from '../../test/mock-function';
import { SocialLinksService } from './social-links.service';

describe('SocialLinksService', () => {
  it('creates a social link associated with the owner profile', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => ({
      id: 'profile-1',
    }));
    const created = { id: 'link-1', platform: 'GITHUB' };
    const create = createMockFunction(async (_args: unknown) => created);
    const prisma = {
      profile: { findUnique: findUnique.fn },
      socialLink: { create: create.fn },
    } as unknown as PrismaService;
    const service = new SocialLinksService(prisma);

    await expect(
      service.create('user-1', {
        platform: 'GITHUB',
        url: 'https://github.com/example',
      }),
    ).resolves.toBe(created);
    expect(create.calls[0][0]).toEqual({
      data: {
        profileId: 'profile-1',
        platform: 'GITHUB',
        url: 'https://github.com/example',
        username: undefined,
        order: 0,
      },
    });
  });

  it('returns not found when the profile does not exist', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => null);
    const create = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: findUnique.fn },
      socialLink: { create: create.fn },
    } as unknown as PrismaService;
    const service = new SocialLinksService(prisma);

    await expect(
      service.create('missing-user', {
        platform: 'GITHUB',
        url: 'https://github.com/example',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(create.calls).toHaveLength(0);
  });

  it('cannot update a social link belonging to a different profile', async () => {
    const findProfile = createMockFunction(async (_args: unknown) => ({
      id: 'profile-1',
    }));
    const findFirst = createMockFunction(async (_args: unknown) => null);
    const update = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: findProfile.fn },
      socialLink: { findFirst: findFirst.fn, update: update.fn },
    } as unknown as PrismaService;
    const service = new SocialLinksService(prisma);

    await expect(
      service.update('user-1', 'foreign-link', { username: 'changed' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(findFirst.calls[0][0]).toEqual({
      where: { id: 'foreign-link', profileId: 'profile-1' },
    });
    expect(update.calls).toHaveLength(0);
  });
});
