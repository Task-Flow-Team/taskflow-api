import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { NotificationRepository } from '@/contexts/domain/repositories/notification.repository.port';
import { Notification } from '@/contexts/domain/models/notification.entity';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private db: PrismaService) {}

  async create(notification: {
    userId: string;
    notification_type: string;
    message: string;
  }): Promise<Notification> {
    return await this.db.notifications.create({
      data: {
        user_id: notification.userId,
        notification_type: notification.notification_type,
        message: notification.message,
        is_read: false,
      },
    }) as Notification;
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return await this.db.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    }) as Notification[];
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const existing = await this.db.notifications.findUnique({
      where: { notification_id: notificationId },
    });
    if (!existing) throw new NotFoundException(`Notification with ID ${notificationId} not found`);

    return await this.db.notifications.update({
      where: { notification_id: notificationId },
      data: { is_read: true },
    }) as Notification;
  }
}
