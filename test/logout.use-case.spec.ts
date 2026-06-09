import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LogoutUseCase } from '@/contexts/application/usecases/auth/logout/logout.use-case';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let authService: { logout: jest.Mock };

  beforeEach(async () => {
    authService = { logout: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        { provide: 'authService', useValue: authService },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
  });

  it('should delegate to authService.logout with the token', async () => {
    authService.logout.mockResolvedValue(undefined);

    await useCase.run('jwt-token');

    expect(authService.logout).toHaveBeenCalledWith('jwt-token');
  });

  it('should propagate UnauthorizedException from authService', async () => {
    authService.logout.mockRejectedValue(new UnauthorizedException('Invalid token'));

    await expect(useCase.run('bad-token')).rejects.toThrow(UnauthorizedException);
  });
});
