import { Notification } from '@/contexts/domain/models/notification.entity';

export abstract class NotificationRepository {
  abstract create(notification: {
    userId: string;
    notification_type: string;
    message: string;
  }): Promise<Notification>;
  abstract findByUser(userId: string): Promise<Notification[]>;
  abstract markAsRead(notificationId: string): Promise<Notification>;
}
