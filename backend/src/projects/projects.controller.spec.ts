import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

describe('ProjectsController', () => {
  it('passes the authenticated user ID to the service', async () => {
    const expected = [{ id: 'resource-1' }];
    let receivedUserId = '';
    const service = {
      findAll: async (userId: string) => {
        receivedUserId = userId;
        return expected;
      },
    };
    const controller = new ProjectsController(service as unknown as ProjectsService);

    await expect(
      controller.findAll({ user: { userId: 'user-123', email: 'user@example.test' } } as never),
    ).resolves.toBe(expected);
    expect(receivedUserId).toBe('user-123');
  });
});
