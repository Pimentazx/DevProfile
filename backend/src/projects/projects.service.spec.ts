import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createMockFunction } from '../../test/mock-function';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  it('creates a project under the owner profile and connects selected skills', async () => {
    const findProfile = createMockFunction(async (_args: unknown) => ({
      id: 'profile-1',
    }));
    const findSkills = createMockFunction(async (_args: unknown) => [
      { id: 'skill-1' },
    ]);
    const project = { id: 'project-1', slug: 'portfolio' };
    const create = createMockFunction(async (_args: unknown) => project);
    const prisma = {
      profile: { findUnique: findProfile.fn },
      skill: { findMany: findSkills.fn },
      project: { create: create.fn },
    } as unknown as PrismaService;
    const service = new ProjectsService(prisma);

    await expect(
      service.create('user-1', {
        name: 'Portfolio',
        slug: 'portfolio',
        type: 'PERSONAL',
        skillIds: ['skill-1'],
      }),
    ).resolves.toBe(project);
    expect(create.calls[0][0]).toMatchObject({
      data: {
        profileId: 'profile-1',
        slug: 'portfolio',
        order: 0,
        skills: {
          create: [{ skill: { connect: { id: 'skill-1' } } }],
        },
      },
    });
  });

  it('rejects project skills that do not exist', async () => {
    const findProfile = createMockFunction(async (_args: unknown) => ({
      id: 'profile-1',
    }));
    const findSkills = createMockFunction(async (_args: unknown) => []);
    const create = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: findProfile.fn },
      skill: { findMany: findSkills.fn },
      project: { create: create.fn },
    } as unknown as PrismaService;
    const service = new ProjectsService(prisma);

    await expect(
      service.create('user-1', {
        name: 'Portfolio',
        slug: 'portfolio',
        type: 'PERSONAL',
        skillIds: ['missing-skill'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create.calls).toHaveLength(0);
  });

  it('requires an existing profile before creating a project', async () => {
    const findProfile = createMockFunction(async (_args: unknown) => null);
    const create = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: findProfile.fn },
      project: { create: create.fn },
    } as unknown as PrismaService;
    const service = new ProjectsService(prisma);

    await expect(
      service.create('missing-user', {
        name: 'Portfolio',
        slug: 'portfolio',
        type: 'PERSONAL',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(create.calls).toHaveLength(0);
  });

  it('maps duplicate project slugs to a conflict response', async () => {
    const findProfile = createMockFunction(async (_args: unknown) => ({
      id: 'profile-1',
    }));
    const duplicateSlug = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '7.10.0' },
    );
    const create = createMockFunction(async (_args: unknown) => {
      throw duplicateSlug;
    });
    const prisma = {
      profile: { findUnique: findProfile.fn },
      project: { create: create.fn },
    } as unknown as PrismaService;
    const service = new ProjectsService(prisma);

    await expect(
      service.create('user-1', {
        name: 'Portfolio',
        slug: 'portfolio',
        type: 'PERSONAL',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
