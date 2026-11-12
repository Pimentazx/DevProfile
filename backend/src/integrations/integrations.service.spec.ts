import { PrismaService } from '../prisma/prisma.service';
import { createMockFunction } from '../test-utils/mock-function';
import { IntegrationsService } from './integrations.service';

describe('IntegrationsService', () => {
  it('selects only public integration fields when listing connections', async () => {
    const integrations = [{ id: 'integration-1', provider: 'GITHUB' }];
    const findMany = createMockFunction(async (_args: unknown) => integrations);
    const prisma = { integration: { findMany: findMany.fn } } as unknown as PrismaService;
    const service = new IntegrationsService(prisma);

    await expect(service.findAll('user-1')).resolves.toBe(integrations);
    const query = findMany.calls[0][0] as { where: unknown; select: Record<string, boolean> };
    expect(query.where).toEqual({ userId: 'user-1' });
    expect(query.select).toMatchObject({ id: true, provider: true, expiresAt: true });
    expect(query.select).not.toHaveProperty('accessToken');
    expect(query.select).not.toHaveProperty('refreshToken');
  });
});
