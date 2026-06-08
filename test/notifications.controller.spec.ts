import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsController } from '@/contexts/infrastructure/http-api/v1/notifications';
import { GetUserNotificationsUseCase, MarkNotificationAsReadUseCase } from '@/contexts/application/usecases/notifications';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let getUserNotificationsUseCase: GetUserNotificationsUseCase;
  let markNotificationAsReadUseCase: MarkNotificationAsReadUseCase;

  const mockNotification = {
    id: 'notif-1',
    userId: 'user-1',
    notification_type: 'task_assigned',
    message: 'You have been assigned to a task',
    isRead: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: GetUserNotificationsUseCase, useValue: { run: jest.fn() } },
        { provide: MarkNotificationAsReadUseCase, useValue: { run: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    getUserNotificationsUseCase = module.get(GetUserNotificationsUseCase);
    markNotificationAsReadUseCase = module.get(MarkNotificationAsReadUseCase);
  });

  describe('getMyNotifications', () => {
    it('should return user notifications', async () => {
      jest.spyOn(getUserNotificationsUseCase, 'run').mockResolvedValue([mockNotification] as any);

      const result = await controller.getMyNotifications('user-1');

      expect(result).toEqual([mockNotification]);
      expect(getUserNotificationsUseCase.run).toHaveBeenCalledWith('user-1');
    });
  });

  describe('markAsRead', () => {
    it('should return message and updated notification', async () => {
      const readNotification = { ...mockNotification, isRead: true };
      jest.spyOn(markNotificationAsReadUseCase, 'run').mockResolvedValue(readNotification as any);

      const result = await controller.markAsRead('notif-1');

      expect(result).toEqual({ message: 'Notification marked as read', notification: readNotification });
      expect(markNotificationAsReadUseCase.run).toHaveBeenCalledWith('notif-1');
    });

    it('should propagate NotFoundException from use case', async () => {
      jest.spyOn(markNotificationAsReadUseCase, 'run').mockRejectedValue(new NotFoundException('Notification not found'));

      await expect(controller.markAsRead('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
