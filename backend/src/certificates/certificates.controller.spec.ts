import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';

describe('CertificatesController', () => {
  it('passes the authenticated user ID to the service', async () => {
    const expected = [{ id: 'resource-1' }];
    let receivedUserId = '';
    const service = {
      findAll: async (userId: string) => {
        receivedUserId = userId;
        return expected;
      },
    };
    const controller = new CertificatesController(service as unknown as CertificatesService);

    await expect(
      controller.findAll({ user: { userId: 'user-123', email: 'user@example.test' } } as never),
    ).resolves.toBe(expected);
    expect(receivedUserId).toBe('user-123');
  });
});
