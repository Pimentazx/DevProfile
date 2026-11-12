import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DegreeType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createMockFunction } from '../test-utils/mock-function';
import { EducationService } from './education.service';

describe('EducationService', () => {
  it('creates an education record with converted dates and profile ownership', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => ({ id: 'profile-1' }));
    const created = { id: 'education-1' };
    const create = createMockFunction(async (_args: unknown) => created);
    const prisma = {
      profile: { findUnique: findUnique.fn },
      education: { create: create.fn },
    } as unknown as PrismaService;
    const service = new EducationService(prisma);

    await expect(
      service.create('user-1', {
        institution: 'University',
        course: 'Software Engineering',
        degree: DegreeType.BACHELOR,
        startDate: '2022-01-01',
        endDate: '2025-01-01',
        current: false,
      }),
    ).resolves.toBe(created);

    expect(create.calls[0][0]).toMatchObject({
      data: {
        profileId: 'profile-1',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2025-01-01'),
        current: false,
      },
    });
  });

  it('rejects a current course that also has an end date', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => ({ id: 'profile-1' }));
    const create = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: findUnique.fn },
      education: { create: create.fn },
    } as unknown as PrismaService;
    const service = new EducationService(prisma);

    await expect(
      service.create('user-1', {
        institution: 'University',
        course: 'Course',
        degree: DegreeType.BACHELOR,
        startDate: '2022-01-01',
        endDate: '2025-01-01',
        current: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findUnique.calls).toHaveLength(0);
    expect(create.calls).toHaveLength(0);
  });

  it('reports not found when the user has no profile', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => null);
    const create = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: findUnique.fn },
      education: { create: create.fn },
    } as unknown as PrismaService;
    const service = new EducationService(prisma);

    await expect(
      service.create('missing-user', {
        institution: 'University',
        course: 'Course',
        degree: DegreeType.BACHELOR,
        startDate: '2022-01-01',
        current: false,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
