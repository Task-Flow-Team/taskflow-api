import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@/contexts/infrastructure/http-api/v1/auth/Auth.controller';
import {
  LoginUseCase,
  RegisterUseCase,
  VerifyEmailUseCase,
  ResendEmailVerificationUseCase,
  LogoutUseCase,
  ResetPasswordUseCase,
} from '@/contexts/application/usecases/auth';
import {
  LoginRequestDto,
  RegisterRequestDto,
  VerifyEmailRequestDto,
  ResetPasswordRequestDto,
  ResetPasswordConfirmDto,
} from '@/contexts/infrastructure/http-api/v1/auth/dtos';
import { BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';

describe('AuthController', () => {
  let authController: AuthController;
  let loginUseCase: LoginUseCase;
  let registerUseCase: RegisterUseCase;
  let verifyEmailUseCase: VerifyEmailUseCase;
  let resendEmailVerificationUseCase: ResendEmailVerificationUseCase;
  let logoutUseCase: LogoutUseCase;
  let resetPasswordUseCase: ResetPasswordUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: {
            run: jest.fn(),
          },
        },
        {
          provide: RegisterUseCase,
          useValue: {
            run: jest.fn(),
          },
        },
        {
          provide: VerifyEmailUseCase,
          useValue: {
            verifyEmail: jest.fn(),
            confirmVerification: jest.fn(),
          },
        },
        {
          provide: ResendEmailVerificationUseCase,
          useValue: {
            resendEmailVerification: jest.fn(),
          },
        },
        {
          provide: LogoutUseCase,
          useValue: {
            run: jest.fn(),
          },
        },
        {
          provide: ResetPasswordUseCase,
          useValue: {
            sendResetPasswordEmail: jest.fn(),
            confirmResetPassword: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    authController = module.get<AuthController>(AuthController);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    registerUseCase = module.get<RegisterUseCase>(RegisterUseCase);
    verifyEmailUseCase = module.get<VerifyEmailUseCase>(VerifyEmailUseCase);
    resendEmailVerificationUseCase = module.get<ResendEmailVerificationUseCase>(ResendEmailVerificationUseCase);
    logoutUseCase = module.get<LogoutUseCase>(LogoutUseCase);
    resetPasswordUseCase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
  });

  describe('login', () => {
    it('should return an access token when login is successful', async () => {
      const loginDto: LoginRequestDto = { email: 'test@example.com', password: 'password' };
      const result = { access_token: 'dummy_token' };

      jest.spyOn(loginUseCase, 'run').mockResolvedValue(result as any);

      expect(await authController.login(loginDto)).toEqual(result);
    });

    it('should throw a BadRequestException when login fails', async () => {
      const loginDto: LoginRequestDto = { email: 'test@example.com', password: 'wrong_password' };

      jest.spyOn(loginUseCase, 'run').mockRejectedValue(new BadRequestException('Invalid credentials'));

      await expect(authController.login(loginDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('register', () => {
    it('should return an access token when registration is successful', async () => {
      const registerDto: RegisterRequestDto = { email: 'test@example.com', password: 'password', username: 'testuser' };
      const result = { access_token: 'dummy_token' };

      jest.spyOn(registerUseCase, 'run').mockResolvedValue(result as any);

      expect(await authController.register(registerDto)).toEqual(result);
    });

    it('should throw a BadRequestException when registration fails', async () => {
      const registerDto: RegisterRequestDto = { email: 'test@example.com', password: 'password', username: 'testuser' };

      jest.spyOn(registerUseCase, 'run').mockRejectedValue(new BadRequestException('Email already exists'));

      await expect(authController.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should return a success message when logout is successful', async () => {
      const mockRequest = { headers: { authorization: 'Bearer valid_token' } } as unknown as Request;

      jest.spyOn(logoutUseCase, 'run').mockResolvedValue(undefined as any);

      expect(await authController.logout(mockRequest)).toEqual({ message: 'Successfully logged out' });
    });

    it('should throw when logout use case fails', async () => {
      const mockRequest = { headers: { authorization: 'Bearer invalid_token' } } as unknown as Request;

      jest.spyOn(logoutUseCase, 'run').mockRejectedValue(new BadRequestException('Invalid token'));

      await expect(authController.logout(mockRequest)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyEmail', () => {
    it('should return a success message when email verification is successful', async () => {
      const verifyEmailDto: VerifyEmailRequestDto = { userId: 'valid-user-id' };

      jest.spyOn(verifyEmailUseCase, 'verifyEmail').mockResolvedValue(true);

      expect(await authController.verifyEmail(verifyEmailDto)).toEqual({ message: 'Verification email sent successfully' });
    });

    it('should throw a BadRequestException when email verification fails', async () => {
      const verifyEmailDto: VerifyEmailRequestDto = { userId: 'invalid-user-id' };

      jest.spyOn(verifyEmailUseCase, 'verifyEmail').mockRejectedValue(new BadRequestException('User not found'));

      await expect(authController.verifyEmail(verifyEmailDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmEmail', () => {
    it('should return a success message when email confirmation is successful', async () => {
      const token = 'valid-token';

      jest.spyOn(verifyEmailUseCase, 'confirmVerification').mockResolvedValue(true);

      expect(await authController.confirmEmail(token)).toEqual({ message: 'Email successfully verified' });
    });

    it('should throw a BadRequestException when email confirmation fails', async () => {
      const token = 'invalid-token';

      jest.spyOn(verifyEmailUseCase, 'confirmVerification').mockRejectedValue(new BadRequestException('Invalid token'));

      await expect(authController.confirmEmail(token)).rejects.toThrow(BadRequestException);
    });
  });

  describe('resendEmail', () => {
    it('should return a success message when resending verification email is successful', async () => {
      const verifyEmailDto: VerifyEmailRequestDto = { userId: 'valid-user-id' };

      jest.spyOn(resendEmailVerificationUseCase, 'resendEmailVerification').mockResolvedValue(true);

      expect(await authController.resendEmail(verifyEmailDto)).toEqual({ message: 'Verification email successfully re-sent' });
    });

    it('should throw a BadRequestException when resending verification email fails', async () => {
      const verifyEmailDto: VerifyEmailRequestDto = { userId: 'invalid-user-id' };

      jest.spyOn(resendEmailVerificationUseCase, 'resendEmailVerification').mockRejectedValue(new BadRequestException('User not found'));

      await expect(authController.resendEmail(verifyEmailDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should return a success message when sending reset password email is successful', async () => {
      const resetPasswordRequestDto: ResetPasswordRequestDto = { email: 'test@example.com' };

      jest.spyOn(resetPasswordUseCase, 'sendResetPasswordEmail').mockResolvedValue(true);

      expect(await authController.resetPassword(resetPasswordRequestDto)).toEqual({ message: 'Password reset email sent successfully' });
    });

    it('should throw a BadRequestException when sending reset password email fails', async () => {
      const resetPasswordRequestDto: ResetPasswordRequestDto = { email: 'invalid@example.com' };

      jest.spyOn(resetPasswordUseCase, 'sendResetPasswordEmail').mockRejectedValue(new BadRequestException('User not found'));

      await expect(authController.resetPassword(resetPasswordRequestDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmResetPassword', () => {
    it('should return a success message when confirming reset password is successful', async () => {
      const resetPasswordConfirmDto: ResetPasswordConfirmDto = { token: 'valid-token', newPassword: 'newpass' };

      jest.spyOn(resetPasswordUseCase, 'confirmResetPassword').mockResolvedValue(true);

      expect(await authController.confirmResetPassword(resetPasswordConfirmDto)).toEqual({ message: 'Password reset successfully' });
    });

    it('should throw a BadRequestException when confirming reset password fails', async () => {
      const resetPasswordConfirmDto: ResetPasswordConfirmDto = { token: 'invalid-token', newPassword: 'newpass' };

      jest.spyOn(resetPasswordUseCase, 'confirmResetPassword').mockRejectedValue(new BadRequestException('Invalid token'));

      await expect(authController.confirmResetPassword(resetPasswordConfirmDto)).rejects.toThrow(BadRequestException);
    });
  });
});
