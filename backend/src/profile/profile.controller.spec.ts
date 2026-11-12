import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

describe('ProfileController', () => {
  it('passes the authenticated user ID to the service', async () => {
    const expected = [{ id: 'resource-1' }];
    let receivedUserId = '';
    const service = {
      findMyProfile: async (userId: string) => {
        receivedUserId = userId;
        return expected;
      },
    };
    const controller = new ProfileController(service as unknown as ProfileService);

    await expect(
      controller.findMyProfile({ user: { userId: 'user-123', email: 'user@example.test' } } as never),
    ).resolves.toBe(expected);
    expect(receivedUserId).toBe('user-123');
  });
});
