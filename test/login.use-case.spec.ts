import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from '@/contexts/application/usecases/auth/login/login.use-case';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = { login: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: 'authService', useValue: authService },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should delegate to authService.login and return the token', async () => {
    const body = { email: 'test@example.com', password: 'password' };
    const result = { access_token: 'jwt-token' };
    authService.login.mockResolvedValue(result);

    const response = await useCase.run(body as any);

    expect(authService.login).toHaveBeenCalledWith(body);
    expect(response).toEqual(result);
  });

  it('should propagate UnauthorizedException from authService', async () => {
    authService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

    await expect(useCase.run({ email: 'x', password: 'y' } as any)).rejects.toThrow(UnauthorizedException);
  });
});
