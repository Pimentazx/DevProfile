import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createMockFunction } from '../../test/mock-function';
import { SkillsService } from './skills.service';

describe('SkillsService', () => {
  it('creates a shared skill and associates it with the user profile', async () => {
    const findProfile = createMockFunction(async (_args: unknown) => ({ id: 'profile-1' }));
    const findSkill = createMockFunction(async (_args: unknown) => null);
    const skill = { id: 'skill-1', name: 'TypeScript', category: 'BACKEND' };
    const createSkill = createMockFunction(async (_args: unknown) => skill);
    const createAssociation = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: findProfile.fn },
      skill: { findUnique: findSkill.fn, create: createSkill.fn },
      profileSkill: { create: createAssociation.fn },
    } as unknown as PrismaService;
    const service = new SkillsService(prisma);

    await expect(
      service.create('user-1', {
        name: '  TypeScript  ',
        category: 'BACKEND',
        level: 'ADVANCED',
      }),
    ).resolves.toMatchObject({ name: 'TypeScript', level: 'ADVANCED', order: 0 });
    expect(createSkill.calls[0][0]).toEqual({
      data: { name: 'TypeScript', category: 'BACKEND' },
    });
    expect(createAssociation.calls[0][0]).toMatchObject({
      data: { profileId: 'profile-1', skillId: 'skill-1', level: 'ADVANCED', order: 0 },
    });
  });

  it('rejects a shared skill registered with a different category', async () => {
    const findProfile = createMockFunction(async (_args: unknown) => ({ id: 'profile-1' }));
    const findSkill = createMockFunction(async (_args: unknown) => ({
      id: 'skill-1',
      name: 'TypeScript',
      category: 'LANGUAGE',
    }));
    const createAssociation = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: findProfile.fn },
      skill: { findUnique: findSkill.fn },
      profileSkill: { create: createAssociation.fn },
    } as unknown as PrismaService;
    const service = new SkillsService(prisma);

    await expect(
      service.create('user-1', { name: 'TypeScript', category: 'BACKEND' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(createAssociation.calls).toHaveLength(0);
  });
});
