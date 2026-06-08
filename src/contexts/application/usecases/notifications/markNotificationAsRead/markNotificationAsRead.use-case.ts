import { Inject, Injectable } from '@nestjs/common';
import { NotificationRepository } from '@/contexts/domain/repositories/notification.repository.port';
import { Notification } from '@/contexts/domain/models/notification.entity';

@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    @Inject('notificationRepository') private notificationRepository: NotificationRepository,
  ) {}

  async run(notificationId: string): Promise<Notification> {
    return await this.notificationRepository.markAsRead(notificationId);
  }
}
