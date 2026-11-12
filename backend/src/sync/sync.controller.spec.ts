import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';

describe('SyncController', () => {
  it('passes the authenticated user ID to the service', async () => {
    const expected = [{ id: 'resource-1' }];
    let receivedUserId = '';
    const service = {
      findAll: async (userId: string) => {
        receivedUserId = userId;
        return expected;
      },
    };
    const controller = new SyncController(service as unknown as SyncService);

    await expect(
      controller.findAll({ user: { userId: 'user-123', email: 'user@example.test' } } as never),
    ).resolves.toBe(expected);
    expect(receivedUserId).toBe('user-123');
  });
});
