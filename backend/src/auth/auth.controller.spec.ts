import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  it('forwards the registration payload to AuthService', async () => {
    const dto = { email: 'user@example.test', fullName: 'User', password: 'Password123' };
    const service = { register: async (input: unknown) => input };
    const controller = new AuthController(service as unknown as AuthService);

    await expect(controller.register(dto)).resolves.toBe(dto);
  });
});
