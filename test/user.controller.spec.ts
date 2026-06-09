import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from '@/contexts/infrastructure/http-api/v1/users/User.controller';
import * as UserUseCases from '@/contexts/application/usecases/users';
import * as AuthUseCases from '@/contexts/application/usecases/auth';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';

describe('UserController', () => {
  let controller: UserController;
  let getAllUsersUseCase: UserUseCases.getAllUsersUseCase;
  let getUserByIdUseCase: UserUseCases.getUserByIdUseCase;
  let getUserByEmailUseCase: UserUseCases.getUserByEmailUseCase;
  let getProfileUseCase: UserUseCases.GetProfileUseCase;
  let updateProfileUseCase: UserUseCases.UpdateProfileUseCase;
  let getSettingsUseCase: UserUseCases.GetSettingsUseCase;
  let updateSettingsUseCase: UserUseCases.UpdateSettingsUseCase;
  let changePasswordUseCase: AuthUseCases.ChangePasswordUseCase;
  let deleteUserUseCase: UserUseCases.deleteUserUseCase;

  const mockUser = { id: 'user-1', email: 'test@example.com', username: 'testuser' };
  const mockProfile = { userId: 'user-1', firstName: 'Test', lastName: 'User' };
  const mockSettings = { userId: 'user-1', theme: 'dark' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: AuthUseCases.ChangePasswordUseCase, useValue: { run: jest.fn() } },
        { provide: UserUseCases.getAllUsersUseCase, useValue: { run: jest.fn() } },
        { provide: UserUseCases.getUserByIdUseCase, useValue: { run: jest.fn() } },
        { provide: UserUseCases.getUserByEmailUseCase, useValue: { run: jest.fn() } },
        { provide: UserUseCases.getUserByUsernameUseCase, useValue: { run: jest.fn() } },
        { provide: UserUseCases.GetSettingsUseCase, useValue: { run: jest.fn() } },
        { provide: UserUseCases.UpdateSettingsUseCase, useValue: { run: jest.fn() } },
        { provide: UserUseCases.GetProfileUseCase, useValue: { run: jest.fn() } },
        { provide: UserUseCases.UpdateProfileUseCase, useValue: { run: jest.fn() } },
        { provide: UserUseCases.deleteUserUseCase, useValue: { run: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    getAllUsersUseCase = module.get(UserUseCases.getAllUsersUseCase);
    getUserByIdUseCase = module.get(UserUseCases.getUserByIdUseCase);
    getUserByEmailUseCase = module.get(UserUseCases.getUserByEmailUseCase);
    getProfileUseCase = module.get(UserUseCases.GetProfileUseCase);
    updateProfileUseCase = module.get(UserUseCases.UpdateProfileUseCase);
    getSettingsUseCase = module.get(UserUseCases.GetSettingsUseCase);
    updateSettingsUseCase = module.get(UserUseCases.UpdateSettingsUseCase);
    changePasswordUseCase = module.get(AuthUseCases.ChangePasswordUseCase);
    deleteUserUseCase = module.get(UserUseCases.deleteUserUseCase);
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      jest.spyOn(getAllUsersUseCase, 'run').mockResolvedValue([mockUser] as any);
      const result = await controller.getAllUsers();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('getUserById', () => {
    it('should return the user', async () => {
      jest.spyOn(getUserByIdUseCase, 'run').mockResolvedValue(mockUser as any);
      const result = await controller.getUserById('user-1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserByEmail', () => {
    it('should return the user when found', async () => {
      jest.spyOn(getUserByEmailUseCase, 'run').mockResolvedValue(mockUser as any);
      const result = await controller.getUserByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(getUserByEmailUseCase, 'run').mockResolvedValue(null as any);
      await expect(controller.getUserByEmail('missing@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should return success message', async () => {
      jest.spyOn(deleteUserUseCase, 'run').mockResolvedValue({ message: 'User deleted' } as any);
      const result = await controller.deleteUser('user-1');
      expect(result).toEqual({ message: 'User deleted' });
    });
  });

  describe('changePassword', () => {
    it('should return success message', async () => {
      jest.spyOn(changePasswordUseCase, 'run').mockResolvedValue(undefined as any);
      const result = await controller.changePassword('user-1', { oldPassword: 'old', newPassword: 'new' });
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('should propagate errors from use case', async () => {
      jest.spyOn(changePasswordUseCase, 'run').mockRejectedValue(new Error('Wrong password'));
      await expect(controller.changePassword('user-1', { oldPassword: 'wrong', newPassword: 'new' })).rejects.toThrow('Wrong password');
    });
  });

  describe('getUserProfile', () => {
    it('should return the user profile', async () => {
      jest.spyOn(getProfileUseCase, 'run').mockResolvedValue(mockProfile as any);
      const result = await controller.getUserProfile('user-1');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateUserProfile', () => {
    it('should return message and updated profile', async () => {
      const updated = { ...mockProfile, firstName: 'Updated' };
      jest.spyOn(updateProfileUseCase, 'run').mockResolvedValue(updated as any);
      const result = await controller.updateUserProfile('user-1', { firstName: 'Updated' } as any);
      expect(result).toEqual({ message: 'Profile updated successfully', profile: updated });
    });
  });

  describe('getUserSettings', () => {
    it('should return user settings', async () => {
      jest.spyOn(getSettingsUseCase, 'run').mockResolvedValue(mockSettings as any);
      const result = await controller.getUserSettings('test@example.com');
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateUserSettings', () => {
    it('should return message and updated settings', async () => {
      const updated = { ...mockSettings, theme: 'light' };
      jest.spyOn(updateSettingsUseCase, 'run').mockResolvedValue(updated as any);
      const result = await controller.updateUserSettings('user-1', { theme: 'light' } as any);
      expect(result).toEqual({ message: 'Settings successfully updated.', settings: updated });
    });
  });
});
