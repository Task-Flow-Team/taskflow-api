import {
    Controller,
    Get,
    Post,
    Patch,
    HttpStatus,
    Body,
    Param,
    NotFoundException,
    HttpCode,
    BadRequestException,
    UseGuards,
    Request, Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; // Import para Swagger
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';
import { Roles, User as UserDecorator } from '@/contexts/shared/lib/decorators';
import * as UserUseCases from '@/contexts/application/usecases/users';
import * as AuthDtos from '@/contexts/infrastructure/http-api/v1/auth/dtos';
import * as AuthUseCases from '@/contexts/application/usecases/auth';
import { API_VERSION } from "@/contexts/infrastructure/http-api/v1/route.constants";
import { User, UserProfile, UserSettings } from "@/contexts/domain/models/";
import { UpdateUserProfileDto, UpdateUserSettingsDto } from '@/contexts/infrastructure/http-api/v1/users/dtos';

@ApiTags('Users')               // Para agrupar en la doc de Swagger
@ApiBearerAuth()                // Indica que se usa el JWT "Es para swagger"
@UseGuards(JwtAuthGuard)        // Todos los endpoints requieren JWT
@Controller(`${API_VERSION}/users`)
export class UserController {
    constructor(
      private readonly changePasswordUseCase: AuthUseCases.ChangePasswordUseCase,
      private readonly getAllUsersUseCase: UserUseCases.getAllUsersUseCase,
      private readonly getUserByIdUseCase: UserUseCases.getUserByIdUseCase,
      private readonly getUserByEmailUseCase: UserUseCases.getUserByEmailUseCase,
      private readonly getUserByUsernameUseCase: UserUseCases.getUserByUsernameUseCase,
      private readonly getSettingsUseCase: UserUseCases.GetSettingsUseCase,
      private readonly updateSettingsUseCase: UserUseCases.UpdateSettingsUseCase,
      private readonly getProfileUseCase: UserUseCases.GetProfileUseCase,
      private readonly updateProfileUseCase: UserUseCases.UpdateProfileUseCase,
      private readonly deleteUserUseCase: UserUseCases.deleteUserUseCase,
    ) {}

    @Get()
    @Roles('ADMIN')
    @HttpCode(HttpStatus.OK)
    async getAllUsers(): Promise<User[]> {
        return this.getAllUsersUseCase.run();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Roles('ADMIN')
    async getUserById(@Param('id') userId: string): Promise<User> {
        if (!userId) throw new BadRequestException('User ID is required');
        return await this.getUserByIdUseCase.run(userId);
    }

    @Get('email/:email')
    @HttpCode(HttpStatus.OK)
    @Roles('ADMIN')
    async getUserByEmail(@Param('email') email: string): Promise<User> {
        if (!email) throw new BadRequestException('Email is required');
        const user = await this.getUserByEmailUseCase.run(email);
        if (!user) throw new NotFoundException(`User with email ${email} not found`);
        return user;
    }

    @Get('username/:username')
    @HttpCode(HttpStatus.OK)
    @Roles('ADMIN')
    async getUserByUsername(@Param('username') username: string): Promise<User> {
        if (!username) throw new BadRequestException('Username is required');
        const user = await this.getUserByUsernameUseCase.run(username);
        if (!user) throw new NotFoundException(`User with username ${username} not found`);
        return user;
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.OK)
    async deleteUser(@Param('id') userId: string): Promise<{ message: string }> {
        if (!userId) throw new BadRequestException('User ID is required');
        return this.deleteUserUseCase.run(userId);
    }

    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(
      @UserDecorator('id') userId: string,
      @Body() changePasswordDto: AuthDtos.ChangePasswordDto,
    ): Promise<{ message: string }> {
        await this.changePasswordUseCase.run(
          userId,
          changePasswordDto.oldPassword,
          changePasswordDto.newPassword,
        );
        return { message: 'Password changed successfully' };
    }

    @Get('profile/me')
    @HttpCode(HttpStatus.OK)
    async getUserProfile(@UserDecorator('id') userId: string): Promise<UserProfile> {
        if (!userId) throw new BadRequestException('User ID is required');
        return this.getProfileUseCase.run(userId);
    }

    @Patch('profile/me')
    @HttpCode(HttpStatus.OK)
    async updateUserProfile(
      @UserDecorator('id') userId: string,
      @Body() profileDto: UpdateUserProfileDto,
    ): Promise<{ message: string; profile: UserProfile }> {
        if (!userId) {
            throw new BadRequestException('User ID is required');
        }
        const updatedProfile = await this.updateProfileUseCase.run(userId, profileDto as any);
        return {
            message: 'Profile updated successfully',
            profile: updatedProfile,
        };
    }

    @Get('settings/me')
    @HttpCode(HttpStatus.OK)
    async getUserSettings(@UserDecorator('email') userEmail: string): Promise<UserSettings> {
        if (!userEmail) throw new BadRequestException('Email is required');
        return this.getSettingsUseCase.run(userEmail);
    }

    @Patch('settings/me')
    @HttpCode(HttpStatus.OK)
    async updateUserSettings(@UserDecorator('id') userId: string, @Body() settingsDto: UpdateUserSettingsDto): Promise<{ message: string; settings: any }> {
        if (!userId) throw new BadRequestException('User ID is required');
        const updatedSettings = await this.updateSettingsUseCase.run(userId, settingsDto as any);
        return {
            message: 'Settings successfully updated.',
            settings: updatedSettings,
        };
    }
}
