import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createMockFunction } from '../test-utils/mock-function';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('normalizes registration data, hashes the password, and signs a token', async () => {
    const user = { id: 'user-1', email: 'person@example.test' };
    const createUser = createMockFunction(
      async (_email: string, _passwordHash: string, _fullName: string) => user,
    );
    const signAsync = createMockFunction(async (_payload: unknown) => 'jwt-token');
    const usersService = { createUser: createUser.fn } as unknown as UsersService;
    const jwtService = { signAsync: signAsync.fn } as unknown as JwtService;
    const service = new AuthService(usersService, jwtService);

    await expect(
      service.register({
        email: ' PERSON@EXAMPLE.TEST ',
        fullName: '  Person  ',
        password: 'Password123',
      }),
    ).resolves.toEqual({ user, accessToken: 'jwt-token' });

    const [email, passwordHash, fullName] = createUser.calls[0];
    expect(email).toBe('person@example.test');
    expect(fullName).toBe('Person');
    expect(passwordHash).not.toBe('Password123');
    expect(passwordHash).toMatch(/^\$2[aby]\$/);
    expect(signAsync.calls[0][0]).toEqual({
      sub: 'user-1',
      email: 'person@example.test',
    });
  });

  it('rejects login when the email does not exist', async () => {
    const findByEmail = createMockFunction(async (_email: string) => null);
    const usersService = { findByEmail: findByEmail.fn } as unknown as UsersService;
    const jwtService = { signAsync: async () => 'unused' } as unknown as JwtService;
    const service = new AuthService(usersService, jwtService);

    await expect(
      service.login({ email: 'missing@example.test', password: 'Password123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
