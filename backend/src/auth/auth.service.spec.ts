import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: bcrypt.hashSync('password123', 10),
  };

  beforeEach(async () => {
    usersService = {
      finduserByEmail: jest.fn().mockResolvedValue(mockUser),
      user: jest.fn().mockResolvedValue(null),
      createUser: jest.fn().mockImplementation((data) => ({ id: 2, ...data })),
      getAllUsers: jest.fn().mockResolvedValue([mockUser]),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mockAccessToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return partial user data (name and email) without password if password matches and id', async () => {
      const result = await authService.validateUser({
        email: mockUser.email,
        password: 'password123',
      });
      expect(result).toEqual({ name: mockUser.name, email: mockUser.email });
    });

    it('should return null if user is not found', async () => {
      (usersService.finduserByEmail as jest.Mock).mockResolvedValue(null);
      const result = await authService.validateUser({
        email: 'wrong@example.com',
        password: 'password123',
      });
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const result = await authService.validateUser({
        email: mockUser.email,
        password: 'wrongpass',
      });
      expect(result).toBeNull();
    });
  });

  describe('authenticate', () => {
    it('should return accessToken and user data on success', async () => {
      const result = await authService.authenticate({
        email: mockUser.email,
        password: 'password123',
      });

      expect(result).toEqual({
        name: mockUser.name,
        email: mockUser.email,
        accessToken: 'mockAccessToken',
      });
    });

    it('should throw UnauthorizedException on failure', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);
      await expect(
        authService.authenticate({
          email: 'test@example.com',
          password: 'wrong',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signIn', () => {
    it('should return signed JWT and user data', async () => {
      const user = { name: 'Test User', email: 'test@example.com' };
      const result = await authService.signIn(user);
      expect(result).toEqual({ accessToken: 'mockAccessToken', ...user });
    });
  });

  describe('register', () => {
    it('should create a user if not existing', async () => {
      const newUser = {
        email: 'new@example.com',
        name: 'New',
        password: 'pass',
      };

      (usersService.user as jest.Mock).mockResolvedValue(null);

      const result = await authService.register(newUser as User);

      expect(result).toMatchObject({
        email: newUser.email,
        name: newUser.name,
      });
      expect(result.password).not.toBe(newUser.password); // should be hashed
    });

    it('should throw if user already exists', async () => {
      (usersService.user as jest.Mock).mockResolvedValue(mockUser);
      await expect(authService.register(mockUser)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const result = await authService.getAllUsers();
      expect(result).toEqual([mockUser]);
    });
  });
});
