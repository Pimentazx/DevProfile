import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EmploymentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createMockFunction } from '../../test/mock-function';
import { ExperiencesService } from './experiences.service';

describe('ExperiencesService', () => {
  it('scopes experience lists to the authenticated user', async () => {
    const experiences = [{ id: 'experience-1' }];
    const findMany = createMockFunction(async (_args: unknown) => experiences);
    const prisma = { experience: { findMany: findMany.fn } } as unknown as PrismaService;
    const service = new ExperiencesService(prisma);

    await expect(service.findAll('user-1')).resolves.toBe(experiences);
    expect(findMany.calls[0][0]).toMatchObject({
      where: { profile: { userId: 'user-1' } },
      orderBy: [{ order: 'asc' }, { startDate: 'desc' }],
    });
  });

  it('trims text and clears end date for a current experience', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => ({ id: 'profile-1' }));
    const created = { id: 'experience-1' };
    const create = createMockFunction(async (_args: unknown) => created);
    const prisma = {
      profile: { findUnique: findUnique.fn },
      experience: { create: create.fn },
    } as unknown as PrismaService;
    const service = new ExperiencesService(prisma);

    await expect(
      service.create('user-1', {
        company: '  Example Co  ',
        role: '  Engineer  ',
        employmentType: EmploymentType.FULL_TIME,
        startDate: '2024-01-01',
        endDate: undefined,
        current: true,
      }),
    ).resolves.toBe(created);

    expect(create.calls[0][0]).toMatchObject({
      data: {
        profileId: 'profile-1',
        company: 'Example Co',
        role: 'Engineer',
        startDate: new Date('2024-01-01'),
        endDate: null,
        current: true,
      },
    });
  });

  it('rejects an end date before the start date', async () => {
    const profileFind = createMockFunction(async (_args: unknown) => ({ id: 'profile-1' }));
    const create = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: profileFind.fn },
      experience: { create: create.fn },
    } as unknown as PrismaService;
    const service = new ExperiencesService(prisma);

    await expect(
      service.create('user-1', {
        company: 'Example Co',
        role: 'Engineer',
        employmentType: EmploymentType.FULL_TIME,
        startDate: '2025-01-01',
        endDate: '2024-01-01',
        current: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(profileFind.calls).toHaveLength(0);
  });

  it('rejects a current experience with an end date', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => ({ id: 'profile-1' }));
    const create = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: findUnique.fn },
      experience: { create: create.fn },
    } as unknown as PrismaService;
    const service = new ExperiencesService(prisma);

    await expect(
      service.create('user-1', {
        company: 'Example Co',
        role: 'Engineer',
        employmentType: EmploymentType.FULL_TIME,
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        current: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create.calls).toHaveLength(0);
  });

  it('reports not found when the owner has no profile', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => null);
    const create = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: findUnique.fn },
      experience: { create: create.fn },
    } as unknown as PrismaService;
    const service = new ExperiencesService(prisma);

    await expect(
      service.create('missing-user', {
        company: 'Example Co',
        role: 'Engineer',
        employmentType: EmploymentType.FULL_TIME,
        startDate: '2024-01-01',
        current: false,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
