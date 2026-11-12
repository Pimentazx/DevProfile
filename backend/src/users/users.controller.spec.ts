import { UsersService } from './users.service';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  it('passes the authenticated user ID to the service', async () => {
    const expected = [{ id: 'resource-1' }];
    let receivedUserId = '';
    const service = {
      findById: async (userId: string) => {
        receivedUserId = userId;
        return expected;
      },
    };
    const controller = new UsersController(service as unknown as UsersService);

    await expect(
      controller.getMe({ user: { userId: 'user-123', email: 'user@example.test' } } as never),
    ).resolves.toBe(expected);
    expect(receivedUserId).toBe('user-123');
  });
});
