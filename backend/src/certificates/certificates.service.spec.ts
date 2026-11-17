import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createMockFunction } from '../../test/mock-function';
import { CertificatesService } from './certificates.service';

describe('CertificatesService', () => {
  it('creates a certificate for the user profile and converts date fields', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => ({ id: 'profile-1' }));
    const created = { id: 'certificate-1' };
    const create = createMockFunction(async (_args: unknown) => created);
    const prisma = {
      profile: { findUnique: findUnique.fn },
      certificate: { create: create.fn },
    } as unknown as PrismaService;
    const service = new CertificatesService(prisma);

    await expect(
      service.create('user-1', {
        name: 'Cloud Basics',
        issuer: 'Example Institute',
        issueDate: '2025-02-01',
      }),
    ).resolves.toBe(created);
    expect(create.calls[0][0]).toMatchObject({
      data: {
        profileId: 'profile-1',
        issueDate: new Date('2025-02-01'),
        expirationDate: null,
        order: 0,
      },
    });
  });

  it('does not create certificates for a missing profile', async () => {
    const findUnique = createMockFunction(async (_args: unknown) => null);
    const create = createMockFunction(async (_args: unknown) => ({}));
    const prisma = {
      profile: { findUnique: findUnique.fn },
      certificate: { create: create.fn },
    } as unknown as PrismaService;
    const service = new CertificatesService(prisma);

    await expect(
      service.create('missing-user', {
        name: 'Cloud Basics',
        issuer: 'Example Institute',
        issueDate: '2025-02-01',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(create.calls).toHaveLength(0);
  });
});
