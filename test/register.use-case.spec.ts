import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from '@/contexts/application/usecases/auth/register/register.use-case';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let authService: { register: jest.Mock };

  beforeEach(async () => {
    authService = { register: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: 'authService', useValue: authService },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
  });

  it('should delegate to authService.register and return the token', async () => {
    const body = { email: 'new@example.com', password: 'password', username: 'newuser' };
    const result = { access_token: 'jwt-token' };
    authService.register.mockResolvedValue(result);

    const response = await useCase.run(body as any);

    expect(authService.register).toHaveBeenCalledWith(body);
    expect(response).toEqual(result);
  });

  it('should propagate ConflictException when email already exists', async () => {
    authService.register.mockRejectedValue(new ConflictException('Email already in use'));

    await expect(useCase.run({ email: 'existing@example.com', password: 'p', username: 'u' } as any))
      .rejects.toThrow(ConflictException);
  });
});
