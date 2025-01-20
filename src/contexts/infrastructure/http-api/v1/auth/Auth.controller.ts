import {
  Controller,
  Headers,
  Post,
  UseGuards,
  Body,
  UsePipes,
  ValidationPipe,
  Query,
  Get,
  HttpStatus,
  HttpCode,
  Request, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as AuthUseCases from '@/contexts/application/usecases/auth';
import { Public } from '@/contexts/shared/lib/decorators';
import { API_VERSION } from '@/contexts/infrastructure/http-api/v1/route.constants';
import * as AuthDtos from './dtos';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { LoginRequestDto } from './dtos';

@Public()
@Controller(`${API_VERSION}/auth`)
export class AuthController {
  constructor(
    private readonly loginUseCase: AuthUseCases.LoginUseCase,
    private readonly registerUseCase: AuthUseCases.RegisterUseCase,
    private readonly verifyEmailUseCase: AuthUseCases.VerifyEmailUseCase,
    private readonly resendEmailVerificationUseCase: AuthUseCases.ResendEmailVerificationUseCase,
    private readonly logoutUseCase: AuthUseCases.LogoutUseCase,
    private readonly resetPasswordUseCase: AuthUseCases.ResetPasswordUseCase,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginBody: AuthDtos.LoginRequestDto,
  ): Promise<AuthDtos.LoginResponseDto> {
    return await this.loginUseCase.run(loginBody);
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerBody: AuthDtos.RegisterRequestDto,
  ): Promise<AuthDtos.RegisterResponseDto> {
    return await this.registerUseCase.run(registerBody);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @ApiBearerAuth() // Indica que el endpoint usa Bearer Token
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request): Promise<{ message: string }> {
    const authHeader = request.headers['authorization']; // Obtén el encabezado Authorization
    const token = authHeader?.split(' ')[1]; // Extrae el token
    if (!token) {
      throw new Error('Token no proporcionado'); // Manejo de error si no hay token
    }

    await this.logoutUseCase.run(token); // Lógica del caso de uso
    return { message: 'Successfully Logged Out' }; // Respuesta
  }

  @Post('verify-email')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() verifyEmailBody: AuthDtos.VerifyEmailRequestDto,
  ): Promise<{ message: string }> {
    await this.verifyEmailUseCase.verifyEmail(verifyEmailBody);
    return { message: 'Verification email sent successfully' };
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(
    @Query('token') token: string,
  ): Promise<{ message: string }> {
    await this.verifyEmailUseCase.confirmVerification(token);
    return { message: 'Email successfully verified' };
  }

  @Post('resend-email')
  @HttpCode(HttpStatus.OK)
  async resendEmail(
    @Body() verifyEmailBody: AuthDtos.VerifyEmailRequestDto,
  ): Promise<{ message: string }> {
    await this.resendEmailVerificationUseCase.resendEmailVerification(
      verifyEmailBody,
    );
    return { message: 'Verification email successfully re-sent' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordRequestDto: AuthDtos.ResetPasswordRequestDto,
  ): Promise<{ message: string }> {
    await this.resetPasswordUseCase.sendResetPasswordEmail(
      resetPasswordRequestDto.email,
      `${API_VERSION}/auth/reset-password/confirm`,
    );
    return {
      message: 'Password reset email sent successfully',
    };
  }

  @Post('reset-password/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmResetPassword(
    @Body() resetPasswordConfirmDto: AuthDtos.ResetPasswordConfirmDto,
  ): Promise<{ message: string }> {
    await this.resetPasswordUseCase.confirmResetPassword(
      resetPasswordConfirmDto.token,
      resetPasswordConfirmDto.newPassword,
    );
    return { message: 'Password reset successfully' };
  }
}
