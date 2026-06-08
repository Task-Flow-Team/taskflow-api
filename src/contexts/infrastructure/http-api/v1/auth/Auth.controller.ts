import {
  Controller,
  Post,
  UseGuards,
  Body,
  UsePipes,
  ValidationPipe,
  Query,
  Get,
  HttpStatus,
  HttpCode,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as AuthUseCases from '@/contexts/application/usecases/auth';
import { Public } from '@/contexts/shared/lib/decorators';
import { API_VERSION } from '@/contexts/infrastructure/http-api/v1/route.constants';
import * as AuthDtos from './dtos';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { LoginRequestDto } from './dtos';

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

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginBody: AuthDtos.LoginRequestDto,
  ): Promise<AuthDtos.LoginResponseDto> {
    return await this.loginUseCase.run(loginBody);
  }

  @Public()
  @Post('register')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerBody: AuthDtos.RegisterRequestDto,
  ): Promise<AuthDtos.RegisterResponseDto> {
    return await this.registerUseCase.run(registerBody);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request): Promise<{ message: string }> {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    await this.logoutUseCase.run(token);
    return { message: 'Successfully logged out' };
  }

  @Public()
  @Post('verify-email')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() verifyEmailBody: AuthDtos.VerifyEmailRequestDto,
  ): Promise<{ message: string }> {
    await this.verifyEmailUseCase.verifyEmail(verifyEmailBody);
    return { message: 'Verification email sent successfully' };
  }

  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(
    @Query('token') token: string,
  ): Promise<{ message: string }> {
    await this.verifyEmailUseCase.confirmVerification(token);
    return { message: 'Email successfully verified' };
  }

  @Public()
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

  @Public()
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

  @Public()
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
